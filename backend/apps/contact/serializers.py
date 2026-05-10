from rest_framework import serializers

from core.i18n_mixin import LangMixin

from .models import Banner, ContactSubmission, SiteConfig


class ContactSubmissionSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = ContactSubmission
        fields = ("id", "name", "phone", "email", "message", "created_at")
        read_only_fields = ("id", "created_at")


class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = (
            "hotline",
            "zalo_url",
            "facebook_url",
            "address",
            "email",
            "google_map_embed",
            "policy_buying",
            "policy_shipping",
            "tagline",
            "tagline_en",
            "about_en",
        )


class BannerSerializer(LangMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    subtitle = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = (
            "id",
            "title",
            "subtitle",
            "image",
            "link",
            "order",
            "is_active",
            "tag",
            "bg_color",
        )

    def get_title(self, obj) -> str:
        return self.localized(obj, "title", "title_en")

    def get_subtitle(self, obj) -> str:
        return self.localized(obj, "subtitle", "subtitle_en")
