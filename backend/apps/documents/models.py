from django.db import models


class DocCategory(models.Model):
    name = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120, blank=True, default="")
    slug = models.SlugField(max_length=140, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "document category"
        verbose_name_plural = "document categories"

    def __str__(self):
        return self.name


class Document(models.Model):
    TYPE_PAPER = "paper"
    TYPE_VIDEO = "video"
    DOC_TYPE_CHOICES = [
        (TYPE_PAPER, "Paper"),
        (TYPE_VIDEO, "Video"),
    ]

    title = models.CharField(max_length=240)
    title_en = models.CharField(max_length=255, blank=True, default="")
    slug = models.SlugField(max_length=260, unique=True)
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    category = models.ForeignKey(
        DocCategory,
        on_delete=models.PROTECT,
        related_name="documents",
    )
    plants = models.ManyToManyField(
        "products.Plant",
        related_name="documents",
        blank=True,
    )
    thumbnail = models.ImageField(upload_to="documents/thumbnails/", blank=True)
    summary = models.CharField(max_length=300)
    summary_en = models.TextField(blank=True, default="")
    content = models.TextField(blank=True)
    content_en = models.TextField(blank=True, default="")
    file = models.FileField(upload_to="documents/", null=True, blank=True)
    video_url = models.URLField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
