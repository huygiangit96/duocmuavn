from django.contrib import admin

from .models import Article, Hashtag, NewsCategory


@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "author",
        "is_published",
        "published_at",
        "view_count",
        "created_at",
    )
    list_filter = ("category", "hashtags", "is_published", "published_at", "created_at")
    search_fields = ("title", "slug", "summary", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("hashtags",)
    readonly_fields = ("view_count", "created_at", "updated_at")
