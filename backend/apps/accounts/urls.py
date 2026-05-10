from django.urls import path

from .views import (
    AddressDetailView,
    AddressListCreateView,
    CommuneListView,
    ProfileView,
    ProvinceListView,
)


app_name = "accounts"

urlpatterns = [
    path("account/profile/", ProfileView.as_view(), name="profile"),
    path("account/addresses/", AddressListCreateView.as_view(), name="address-list"),
    path("account/addresses/<int:pk>/", AddressDetailView.as_view(), name="address-detail"),
    path("provinces/", ProvinceListView.as_view(), name="province-list"),
    path("communes/", CommuneListView.as_view(), name="commune-list"),
]
