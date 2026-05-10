from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Address, Commune, Province, UserProfile


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ("name", "email", "phone", "avatar", "firebase_uid", "created_at")
        read_only_fields = ("email", "firebase_uid", "created_at")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        if "first_name" in user_data:
            instance.user.first_name = user_data["first_name"]
            instance.user.save(update_fields=["first_name"])
        return super().update(instance, validated_data)


class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ("id", "code", "name")


class CommuneSerializer(serializers.ModelSerializer):
    province = ProvinceSerializer(read_only=True)

    class Meta:
        model = Commune
        fields = ("id", "code", "name", "province")


class AddressSerializer(serializers.ModelSerializer):
    province_detail = ProvinceSerializer(source="province", read_only=True)
    commune_detail = CommuneSerializer(source="commune", read_only=True)

    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "receiver_name",
            "phone",
            "address_line",
            "province",
            "province_detail",
            "commune",
            "commune_detail",
            "is_default",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        province = attrs.get("province", getattr(self.instance, "province", None))
        commune = attrs.get("commune", getattr(self.instance, "commune", None))
        if province and commune and commune.province_id != province.id:
            raise serializers.ValidationError(
                {"commune": "Commune must belong to the selected province."}
            )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        address = Address.objects.create(user=request.user, **validated_data)
        self.clear_other_defaults(address)
        return address

    def update(self, instance, validated_data):
        address = super().update(instance, validated_data)
        self.clear_other_defaults(address)
        return address

    def clear_other_defaults(self, address):
        if address.is_default:
            Address.objects.filter(user=address.user).exclude(pk=address.pk).update(
                is_default=False
            )
