from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics

from .filters import DocumentFilter
from .models import DocCategory, Document
from .serializers import (
    DocCategorySerializer,
    DocumentDetailSerializer,
    DocumentListSerializer,
)


class DocCategoryListView(generics.ListAPIView):
    queryset = DocCategory.objects.all()
    serializer_class = DocCategorySerializer
    pagination_class = None


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentListSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = DocumentFilter

    def get_queryset(self):
        return (
            Document.objects.filter(is_published=True)
            .select_related("category")
            .prefetch_related("plants")
        )


class DocumentDetailView(generics.RetrieveAPIView):
    serializer_class = DocumentDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Document.objects.filter(is_published=True)
            .select_related("category")
            .prefetch_related("plants")
        )
