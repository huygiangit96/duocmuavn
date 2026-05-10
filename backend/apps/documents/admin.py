from django.contrib import admin

from .models import DocCategory, Document


@admin.register(DocCategory)
class DocCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "doc_type",
        "category",
        "is_published",
        "created_at",
        "updated_at",
    )
    list_filter = ("doc_type", "category", "plants", "is_published", "created_at")
    search_fields = ("title", "slug", "summary", "content", "video_url")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("plants",)
    readonly_fields = ("created_at", "updated_at")
