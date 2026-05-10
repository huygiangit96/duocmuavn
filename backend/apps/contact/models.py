from django.core.exceptions import ValidationError
from django.db import models


class ContactSubmission(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    email = models.EmailField(null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.phone}"


class SiteConfig(models.Model):
    hotline = models.CharField(max_length=50, blank=True)
    zalo_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    google_map_embed = models.TextField(blank=True)
    policy_buying = models.TextField(blank=True)
    policy_shipping = models.TextField(blank=True)
    tagline = models.CharField(max_length=255, blank=True, default="")
    about = models.TextField(blank=True, default="")
    tagline_en = models.CharField(max_length=255, blank=True, default="")
    about_en = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "site config"
        verbose_name_plural = "site config"

    def __str__(self):
        return "Site config"

    def clean(self):
        if not self.pk and SiteConfig.objects.exists():
            raise ValidationError("Only one SiteConfig instance is allowed.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Banner(models.Model):
    title = models.CharField(max_length=180)
    title_en = models.CharField(max_length=255, blank=True, default="")
    subtitle = models.CharField(max_length=240, blank=True)
    subtitle_en = models.CharField(max_length=255, blank=True, default="")
    image = models.ImageField(upload_to="banners/", blank=True)
    link = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    tag = models.CharField(max_length=100, blank=True)
    bg_color = models.CharField(max_length=255, blank=True)
    LOCATION_HOME = "home"
    LOCATION_PRODUCTS = "products"
    LOCATION_NEWS = "news"
    LOCATION_DOCUMENTS = "documents"
    LOCATION_CHOICES = [
        (LOCATION_HOME, "Trang chủ"),
        (LOCATION_PRODUCTS, "Trang sản phẩm"),
        (LOCATION_NEWS, "Trang tin tức"),
        (LOCATION_DOCUMENTS, "Trang tài liệu"),
    ]
    location = models.CharField(
        max_length=50,
        default="home",
        help_text=(
            "Vị trí hiển thị banner. Nhập nhiều vị trí cách nhau bằng dấu phẩy, "
            "ví dụ: home,products"
        ),
        blank=True,
    )

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title
