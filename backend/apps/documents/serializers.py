from rest_framework import serializers

from apps.products.serializers import PlantSerializer
from core.i18n_mixin import LangMixin

from .models import DocCategory, Document


class DocCategorySerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = DocCategory
        fields = ("id", "name", "slug")

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")


class DocumentListSerializer(LangMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    category = DocCategorySerializer(read_only=True)
    plants = PlantSerializer(many=True, read_only=True)
    file = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "slug",
            "doc_type",
            "category",
            "plants",
            "thumbnail",
            "summary",
            "file",
            "video_url",
            "created_at",
        )

    def get_title(self, obj) -> str:
        return self.localized(obj, "title", "title_en")

    def get_summary(self, obj) -> str:
        return self.localized(obj, "summary", "summary_en")

    def _abs(self, field_value) -> str:
        if not field_value:
            return ""
        request = self.context.get("request")
        url = str(field_value.url) if hasattr(field_value, "url") else str(field_value)
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_file(self, obj) -> str:
        return self._abs(obj.file) if obj.file else ""

    def get_thumbnail(self, obj) -> str:
        return self._abs(obj.thumbnail) if obj.thumbnail else ""


class DocumentDetailSerializer(DocumentListSerializer):
    content = serializers.SerializerMethodField()

    class Meta(DocumentListSerializer.Meta):
        fields = DocumentListSerializer.Meta.fields + (
            "content",
            "is_published",
            "updated_at",
        )

    def get_content(self, obj) -> str:
        return self.localized(obj, "content", "content_en")


DocumentSerializer = DocumentDetailSerializer
