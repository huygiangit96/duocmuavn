from django.contrib import admin

from .models import Banner, ContactSubmission, SiteConfig


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "phone", "email", "message")
    readonly_fields = ("created_at",)


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ("hotline", "email", "facebook_url", "zalo_url")

    def has_add_permission(self, request):
        return not SiteConfig.objects.exists()


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "tag", "link", "order", "is_active")
    list_filter = ("is_active", "tag")
    search_fields = ("title", "subtitle", "tag", "link")
