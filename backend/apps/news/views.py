from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics

from .filters import ArticleFilter
from .models import Article, NewsCategory
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    NewsCategorySerializer,
)


class NewsCategoryListView(generics.ListAPIView):
    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer
    pagination_class = None


class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleListSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = ArticleFilter

    def get_queryset(self):
        return (
            Article.objects.filter(is_published=True)
            .select_related("category", "author")
            .prefetch_related("hashtags")
        )


class ArticleDetailView(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Article.objects.filter(is_published=True)
            .select_related("category", "author")
            .prefetch_related("hashtags")
        )

    def get_object(self):
        obj = super().get_object()
        Article.objects.filter(pk=obj.pk).update(view_count=F("view_count") + 1)
        obj.refresh_from_db(fields=["view_count"])
        return obj
