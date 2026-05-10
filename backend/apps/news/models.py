from django.conf import settings
from django.db import models
from django.utils import timezone


class NewsCategory(models.Model):
    name = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120, blank=True, default="")
    slug = models.SlugField(max_length=140, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "news category"
        verbose_name_plural = "news categories"

    def __str__(self):
        return self.name


class Hashtag(models.Model):
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Article(models.Model):
    title = models.CharField(max_length=240)
    title_en = models.CharField(max_length=255, blank=True, default="")
    slug = models.SlugField(max_length=260, unique=True)
    category = models.ForeignKey(
        NewsCategory,
        on_delete=models.PROTECT,
        related_name="articles",
    )
    hashtags = models.ManyToManyField(Hashtag, related_name="articles", blank=True)
    thumbnail = models.ImageField(upload_to="news/", blank=True)
    summary = models.CharField(max_length=300)
    summary_en = models.TextField(blank=True, default="")
    content = models.TextField()
    content_en = models.TextField(blank=True, default="")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="articles",
    )
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.is_published and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
