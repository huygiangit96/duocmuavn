from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Banner, SiteConfig
from .serializers import BannerSerializer, ContactSubmissionSerializer, SiteConfigSerializer


class ContactSubmissionCreateView(generics.CreateAPIView):
    serializer_class = ContactSubmissionSerializer
    permission_classes = (AllowAny,)


class SiteConfigView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SiteConfigSerializer

    def get(self, request):
        config = SiteConfig.objects.first()
        if config is None:
            return Response({}, status=status.HTTP_200_OK)
        return Response(SiteConfigSerializer(config, context={"request": request}).data)


class BannerListView(generics.ListAPIView):
    serializer_class = BannerSerializer
    permission_classes = (AllowAny,)
    pagination_class = None

    def get_queryset(self):
        qs = Banner.objects.filter(is_active=True).order_by("order", "id")
        location = self.request.query_params.get("location", "")
        if location:
            qs = qs.filter(location__icontains=location)
        return qs
