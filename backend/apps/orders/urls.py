from django.urls import path

from .views import (
    OrderCancelView,
    OrderDetailView,
    OrderListCreateView,
    PromotionValidateView,
)


app_name = "orders"

urlpatterns = [
    path(
        "promotions/validate/",
        PromotionValidateView.as_view(),
        name="promotion-validate",
    ),
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("orders/<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),
    path(
        "orders/<str:order_number>/cancel/",
        OrderCancelView.as_view(),
        name="order-cancel",
    ),
]
