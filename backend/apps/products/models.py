import os
import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


def product_image_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    slug = instance.product.slug if instance.product_id else "product"
    new_name = f"{slug}_{uuid.uuid4().hex[:12]}{ext}"
    return f"products/{new_name}"


class Category(models.Model):
    name = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120, blank=True, default="")
    slug = models.SlugField(max_length=140, unique=True)
    color = models.CharField(max_length=32, blank=True)
    icon = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True, default="")
    description_en = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "category"
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Plant(models.Model):
    name = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120, blank=True, default="")
    slug = models.SlugField(max_length=140, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    TAG_BEST_SELLER = "Bán chạy"
    TAG_NEW = "Mới"
    TAG_PROMOTION = "Khuyến mãi"
    TAG_NONE = ""
    TAG_CHOICES = [
        (TAG_NONE, "Không có"),
        (TAG_BEST_SELLER, "Bán chạy"),
        (TAG_NEW, "Mới"),
        (TAG_PROMOTION, "Khuyến mãi"),
    ]

    name = models.CharField(max_length=220)
    name_en = models.CharField(max_length=255, blank=True, default="")
    slug = models.SlugField(max_length=240, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    plants = models.ManyToManyField(Plant, related_name="products", blank=True)
    tag = models.CharField(max_length=30, choices=TAG_CHOICES, blank=True, default=TAG_NONE)
    price = models.DecimalField(max_digits=12, decimal_places=0)
    sale_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    specs = models.JSONField(default=dict, blank=True)
    specs_en = models.JSONField(default=dict, blank=True)
    short_desc_en = models.TextField(blank=True, default="")
    description = models.TextField(blank=True)
    description_en = models.TextField(blank=True, default="")
    usage = models.TextField(blank=True)
    guide = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="products/", blank=True)
    sale_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to=product_image_upload_path)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} image {self.order}"


class ProductReview(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField()
    comment_en = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} - {self.rating}/5"
