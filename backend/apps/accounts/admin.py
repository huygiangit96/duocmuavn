from django.contrib import admin

from .models import Address, Commune, Province, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "firebase_uid", "created_at")
    search_fields = ("user__username", "user__email", "phone", "firebase_uid")
    readonly_fields = ("created_at",)


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "label",
        "receiver_name",
        "phone",
        "province",
        "commune",
        "is_default",
    )
    list_filter = ("province", "commune", "is_default")
    search_fields = (
        "user__username",
        "user__email",
        "label",
        "receiver_name",
        "phone",
        "address_line",
        "province__name",
        "province__code",
        "commune__name",
        "commune__code",
    )


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("code", "name")
    ordering = ("code",)


@admin.register(Commune)
class CommuneAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "province")
    list_filter = ("province",)
    search_fields = ("code", "name", "province__name")
    ordering = ("province__code", "code")
