from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Address, Commune, Province, UserProfile
from .serializers import (
    AddressSerializer,
    CommuneSerializer,
    ProvinceSerializer,
    UserProfileSerializer,
)


class ProvinceListView(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    pagination_class = None


class CommuneListView(generics.ListAPIView):
    serializer_class = CommuneSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Commune.objects.select_related("province")
        province_id = self.request.query_params.get("province")
        if province_id:
            queryset = queryset.filter(province_id=province_id)
        return queryset


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"firebase_uid": self.request.user.username},
        )
        return profile


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Address.objects.none()
        return (
            Address.objects.filter(user=self.request.user)
            .select_related("province", "commune", "commune__province")
            .order_by("-is_default", "id")
        )


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user).select_related(
            "province", "commune", "commune__province"
        )
