from rest_framework import serializers

from core.i18n_mixin import LangMixin

from .models import Category, Plant, Product, ProductImage, ProductReview


class CategorySerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "color", "icon")

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")


class PlantSerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = ("id", "name", "slug")

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "image_url", "order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class ProductListSerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    short_desc = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    thumbnail = serializers.ImageField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "tag",
            "price",
            "sale_price",
            "short_desc",
            "thumbnail",
            "category",
        )

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")

    def get_short_desc(self, obj) -> str:
        return self.localized(obj, "description", "short_desc_en")


class ProductDetailSerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    specs = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    plants = PlantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    thumbnail = serializers.ImageField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "plants",
            "tag",
            "price",
            "sale_price",
            "specs",
            "description",
            "usage",
            "guide",
            "thumbnail",
            "images",
            "rating",
            "reviews_count",
            "sale_count",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        )

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")

    def get_specs(self, obj) -> dict:
        return self.localized(obj, "specs", "specs_en")

    def get_description(self, obj) -> str:
        return self.localized(obj, "description", "description_en")

    def get_rating(self, obj):
        from django.db.models import Avg

        approved = obj.reviews.filter(status="approved")
        if not approved.exists():
            return 5.0
        result = approved.aggregate(avg=Avg("rating"))["avg"]
        return round(float(result), 1)

    def get_reviews_count(self, obj):
        return obj.reviews.filter(status="approved").count()


class ProductReviewSerializer(serializers.ModelSerializer):
    """Hiển thị review đã approved."""

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ["id", "user_name", "rating", "text", "created_at"]

    def get_user_name(self, obj):
        user = obj.user
        full = f"{user.first_name} {user.last_name}".strip()
        return full or user.email.split("@")[0]


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    """Tạo review mới."""

    class Meta:
        model = ProductReview
        fields = ["rating", "text"]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating phải từ 1 đến 5.")
        return value
