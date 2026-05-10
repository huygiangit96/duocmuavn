from django.urls import path

from .views import (
    MoMoCreateView,
    MoMoIPNView,
    MoMoReturnView,
    VNPayCreateView,
    VNPayReturnView,
)


app_name = "payments"

urlpatterns = [
    path("payments/vnpay/create/", VNPayCreateView.as_view(), name="vnpay-create"),
    path("payments/vnpay/return/", VNPayReturnView.as_view(), name="vnpay-return"),
    path("payments/momo/create/", MoMoCreateView.as_view(), name="momo-create"),
    path("payments/momo/ipn/", MoMoIPNView.as_view(), name="momo-ipn"),
    path("payments/momo/return/", MoMoReturnView.as_view(), name="momo-return"),
]
