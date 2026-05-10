import html as html_module

from rest_framework import serializers

from core.i18n_mixin import LangMixin

from .models import Article, Hashtag, NewsCategory


class NewsCategorySerializer(LangMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = NewsCategory
        fields = ("id", "name", "slug")

    def get_name(self, obj) -> str:
        return self.localized(obj, "name", "name_en")


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ("id", "name")


class ArticleListSerializer(LangMixin, serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    category = NewsCategorySerializer(read_only=True)
    hashtags = HashtagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "hashtags",
            "thumbnail",
            "summary",
            "author_name",
            "published_at",
            "view_count",
        )

    def get_title(self, obj) -> str:
        return self.localized(obj, "title", "title_en")

    def get_summary(self, obj) -> str:
        text = self.localized(obj, "summary", "summary_en")
        return html_module.unescape(text)

    def get_thumbnail(self, obj) -> str:
        if not obj.thumbnail:
            return ""
        request = self.context.get("request")
        url = str(obj.thumbnail.url) if hasattr(obj.thumbnail, "url") else str(obj.thumbnail)
        if request:
            return request.build_absolute_uri(url)
        return url


class ArticleDetailSerializer(ArticleListSerializer):
    content = serializers.SerializerMethodField()

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + (
            "content",
            "created_at",
            "updated_at",
        )

    def get_content(self, obj) -> str:
        return self.localized(obj, "content", "content_en")
