from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .filters import ProductFilter
from .models import Category, Plant, Product, ProductReview
from .serializers import (
    CategorySerializer,
    PlantSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class PlantListView(generics.ListAPIView):
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer
    pagination_class = None


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_class = ProductFilter
    ordering_fields = ("price", "sale_price", "created_at", "sale_count", "sort_order")
    ordering = ("sort_order", "-created_at")

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("plants")
        )


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("plants", "images")
        )


class ProductReviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        from apps.products.serializers import (
            ProductReviewCreateSerializer,
            ProductReviewSerializer,
        )

        if self.request.method == "POST":
            return ProductReviewCreateSerializer
        return ProductReviewSerializer

    def get_queryset(self):
        product = get_object_or_404(Product, slug=self.kwargs["slug"])
        return ProductReview.objects.filter(
            product=product,
            status=ProductReview.STATUS_APPROVED,
        ).select_related("user")

    def perform_create(self, serializer):
        product = get_object_or_404(Product, slug=self.kwargs["slug"])
        if ProductReview.objects.filter(
            product=product, user=self.request.user
        ).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError({"detail": "Bạn đã đánh giá sản phẩm này rồi."})
        serializer.save(
            product=product,
            user=self.request.user,
            status=ProductReview.STATUS_PENDING,
        )
