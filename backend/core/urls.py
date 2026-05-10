from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/admin/", include("core.admin_urls")),
    path("api/", include("apps.products.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/", include("apps.news.urls")),
    path("api/", include("apps.documents.urls")),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.contact.urls")),
    path("api/", include("apps.payments.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
