from io import BytesIO

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.http import HttpResponse
from openpyxl import Workbook
from drf_spectacular.utils import extend_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.contact.models import Banner, ContactSubmission, SiteConfig
from apps.documents.models import DocCategory, Document
from apps.news.models import Article, Hashtag, NewsCategory
from apps.orders.models import Order, Promotion
from apps.products.models import Category, Plant, Product, ProductImage, ProductReview
from core.admin_serializers import (
    AdminArticleSerializer,
    AdminBannerSerializer,
    AdminCategorySerializer,
    AdminContactSubmissionSerializer,
    AdminDocCategorySerializer,
    AdminDocumentSerializer,
    AdminHashtagSerializer,
    AdminNewsCategorySerializer,
    AdminOrderSerializer,
    AdminPlantSerializer,
    AdminProductReviewSerializer,
    AdminProductSerializer,
    AdminPromotionSerializer,
    AdminSiteConfigSerializer,
    AdminStatsSerializer,
    AdminUserSerializer,
)
from core.permissions import IsStaffUser


User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = (IsStaffUser,)

    @extend_schema(responses=AdminStatsSerializer)
    def get(self, request):
        revenue = (
            Order.objects.filter(status=Order.STATUS_DELIVERED).aggregate(total=Sum("total"))[
                "total"
            ]
            or 0
        )
        return Response(
            {
                "orders": Order.objects.count(),
                "revenue": revenue,
                "customers": User.objects.filter(is_staff=False).count(),
                "products": Product.objects.count(),
                "recent_orders": AdminOrderSerializer(
                    Order.objects.prefetch_related("items").order_by("-created_at")[:5],
                    many=True,
                ).data,
                "new_users": AdminUserSerializer(
                    User.objects.order_by("-date_joined")[:5],
                    many=True,
                ).data,
                "orders_by_status": dict(
                    Order.objects.values_list("status")
                    .annotate(count=Count("id"))
                    .order_by("status")
                ),
            }
        )


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminProductSerializer
    lookup_field = "slug"
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "slug", "description")
    ordering_fields = ("price", "sale_price", "created_at", "sale_count", "sort_order")
    queryset = Product.objects.select_related("category").prefetch_related("plants")

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="images",
        parser_classes=[MultiPartParser, FormParser],
    )
    def images(self, request, slug=None):
        from apps.products.serializers import ProductImageSerializer

        product = self.get_object()
        if request.method == "POST":
            serializer = ProductImageSerializer(
                data=request.data, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        qs = product.images.all()
        serializer = ProductImageSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["delete"],
        url_path="images/(?P<image_id>[0-9]+)",
    )
    def image_delete(self, request, slug=None, image_id=None):
        product = self.get_object()
        image = product.images.filter(pk=image_id).first()
        if not image:
            return Response(status=status.HTTP_404_NOT_FOUND)
        image.image.delete(save=False)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminCategorySerializer
    lookup_field = "slug"
    queryset = Category.objects.all()
    filter_backends = (filters.SearchFilter,)
    search_fields = ("name", "slug")


class AdminPlantViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminPlantSerializer
    lookup_field = "slug"
    queryset = Plant.objects.all()
    filter_backends = (filters.SearchFilter,)
    search_fields = ("name", "slug")


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminOrderSerializer
    lookup_field = "order_number"
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("order_number", "receiver_name", "receiver_phone")
    ordering_fields = ("created_at", "total", "status")

    def get_queryset(self):
        queryset = Order.objects.select_related("user").prefetch_related("items")
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, order_number=None):
        order = self.get_object()
        new_status = request.data.get("status")
        valid_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response(
                {"detail": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = new_status
        order.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(order).data)

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Orders"
        sheet.append(
            [
                "Order Number",
                "Customer",
                "Receiver",
                "Phone",
                "Status",
                "Payment Method",
                "Payment Status",
                "Subtotal",
                "Shipping Fee",
                "Total",
                "Created At",
            ]
        )
        for order in self.get_queryset().order_by("-created_at"):
            sheet.append(
                [
                    order.order_number,
                    order.user.email if order.user else "",
                    order.receiver_name,
                    order.receiver_phone,
                    order.status,
                    order.payment_method,
                    order.payment_status,
                    float(order.subtotal),
                    float(order.shipping_fee),
                    float(order.total),
                    order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                ]
            )

        output = BytesIO()
        workbook.save(output)
        output.seek(0)
        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="orders.xlsx"'
        return response


class AdminPromotionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminPromotionSerializer
    queryset = Promotion.objects.all()
    filter_backends = (filters.SearchFilter,)
    search_fields = ("code", "name")


class AdminReviewViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminProductReviewSerializer
    queryset = ProductReview.objects.select_related("product", "user")

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        review = self.get_object()
        review.status = ProductReview.STATUS_APPROVED
        review.save(update_fields=["status"])
        return Response(self.get_serializer(review).data)

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        review = self.get_object()
        review.status = ProductReview.STATUS_REJECTED
        review.save(update_fields=["status"])
        return Response(self.get_serializer(review).data)


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminUserSerializer
    queryset = User.objects.prefetch_related("orders", "orders__items").all().order_by("-date_joined")
    filter_backends = (filters.SearchFilter,)
    search_fields = ("username", "email", "first_name", "last_name")

    @action(detail=True, methods=["patch"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response(self.get_serializer(user).data)


class AdminArticleViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminArticleSerializer
    lookup_field = "slug"
    queryset = Article.objects.select_related("category", "author").prefetch_related("hashtags")
    filter_backends = (filters.SearchFilter,)
    search_fields = ("title", "slug", "summary", "content")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class AdminNewsCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminNewsCategorySerializer
    lookup_field = "slug"
    queryset = NewsCategory.objects.all()


class AdminHashtagViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminHashtagSerializer
    queryset = Hashtag.objects.all()


class AdminDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminDocumentSerializer
    lookup_field = "slug"
    queryset = Document.objects.select_related("category").prefetch_related("plants")
    filter_backends = (filters.SearchFilter,)
    search_fields = ("title", "slug", "summary", "content")


class AdminDocCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminDocCategorySerializer
    lookup_field = "slug"
    queryset = DocCategory.objects.all()


class AdminBannerViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminBannerSerializer
    queryset = Banner.objects.all()


class AdminContactSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminContactSubmissionSerializer
    queryset = ContactSubmission.objects.all()


class AdminSiteConfigViewSet(viewsets.ModelViewSet):
    permission_classes = (IsStaffUser,)
    serializer_class = AdminSiteConfigSerializer
    queryset = SiteConfig.objects.all()
