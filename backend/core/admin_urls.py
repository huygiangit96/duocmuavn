from django.urls import include, path
from rest_framework.routers import DefaultRouter

from core.admin_api import (
    AdminArticleViewSet,
    AdminBannerViewSet,
    AdminCategoryViewSet,
    AdminContactSubmissionViewSet,
    AdminDocCategoryViewSet,
    AdminDocumentViewSet,
    AdminHashtagViewSet,
    AdminNewsCategoryViewSet,
    AdminOrderViewSet,
    AdminPlantViewSet,
    AdminProductViewSet,
    AdminPromotionViewSet,
    AdminReviewViewSet,
    AdminSiteConfigViewSet,
    AdminStatsView,
    AdminUserViewSet,
)


router = DefaultRouter()
router.register("products", AdminProductViewSet, basename="admin-products")
router.register("categories", AdminCategoryViewSet, basename="admin-categories")
router.register("plants", AdminPlantViewSet, basename="admin-plants")
router.register("orders", AdminOrderViewSet, basename="admin-orders")
router.register("promotions", AdminPromotionViewSet, basename="admin-promotions")
router.register("reviews", AdminReviewViewSet, basename="admin-reviews")
router.register("users", AdminUserViewSet, basename="admin-users")
router.register("news", AdminArticleViewSet, basename="admin-news")
router.register("news-categories", AdminNewsCategoryViewSet, basename="admin-news-categories")
router.register("hashtags", AdminHashtagViewSet, basename="admin-hashtags")
router.register("documents", AdminDocumentViewSet, basename="admin-documents")
router.register("document-categories", AdminDocCategoryViewSet, basename="admin-document-categories")
router.register("banners", AdminBannerViewSet, basename="admin-banners")
router.register("contacts", AdminContactSubmissionViewSet, basename="admin-contacts")
router.register("site-config", AdminSiteConfigViewSet, basename="admin-site-config")


urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("", include(router.urls)),
]
