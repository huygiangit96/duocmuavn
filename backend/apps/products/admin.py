from django.contrib import admin

from .models import Category, Plant, Product, ProductImage, ProductReview


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color", "icon", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at",)


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "order")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "tag",
        "price",
        "sale_price",
        "sale_count",
        "is_active",
        "sort_order",
        "created_at",
    )
    list_filter = ("category", "plants", "tag", "is_active", "created_at")
    search_fields = ("name", "slug", "description", "usage", "guide")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("plants",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [ProductImageInline]


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "status", "created_at")
    list_filter = ("status", "rating", "created_at")
    search_fields = ("product__name", "user__username", "user__email", "text")
    readonly_fields = ("created_at",)
