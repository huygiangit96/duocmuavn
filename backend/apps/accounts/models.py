from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    full_name = models.CharField(max_length=150, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    firebase_uid = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.user.get_username()


class Province(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return self.name


class Commune(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    province = models.ForeignKey(
        Province,
        on_delete=models.CASCADE,
        related_name="communes",
    )

    class Meta:
        ordering = ["province__code", "code"]

    def __str__(self):
        return self.name


class Address(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    label = models.CharField(max_length=80)
    receiver_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    address_line = models.TextField()
    province = models.ForeignKey(
        Province,
        on_delete=models.SET_NULL,
        related_name="addresses",
        null=True,
        blank=True,
    )
    commune = models.ForeignKey(
        Commune,
        on_delete=models.SET_NULL,
        related_name="addresses",
        null=True,
        blank=True,
    )
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_default", "id"]
        verbose_name_plural = "addresses"

    def __str__(self):
        return f"{self.label} - {self.receiver_name}"
