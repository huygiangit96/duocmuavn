from django.urls import path

from .views import (
    CategoryListView,
    PlantListView,
    ProductDetailView,
    ProductListView,
    ProductReviewListCreateView,
)


app_name = "products"

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("plants/", PlantListView.as_view(), name="plant-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path(
        "products/<slug:slug>/reviews/",
        ProductReviewListCreateView.as_view(),
        name="product-reviews",
    ),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
]
