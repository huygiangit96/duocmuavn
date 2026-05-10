from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Promotion
from .serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderCreateSerializer
        return OrderDetailSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Order.objects.none()
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items", "items__product")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        output = OrderDetailSerializer(order, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = "order_number"
    lookup_url_kwarg = "order_number"

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items", "items__product"
        )


class OrderCancelView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderDetailSerializer

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status != Order.STATUS_PENDING:
            return Response(
                {"detail": "Only pending orders can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.STATUS_CANCELLED
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderDetailSerializer(order).data)


class PromotionValidateView(APIView):
    """
    POST /api/promotions/validate/
    Body: {"code": "PROMO10", "order_value": 500000}
    Trả về thông tin giảm giá hoặc lỗi.
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        code = (request.data.get("code") or "").strip().upper()
        try:
            order_value = int(request.data.get("order_value") or 0)
        except (ValueError, TypeError):
            order_value = 0

        if not code:
            return Response(
                {"valid": False, "message": "Vui lòng nhập mã giảm giá."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            promo = Promotion.objects.get(code__iexact=code, is_active=True)
        except Promotion.DoesNotExist:
            return Response(
                {
                    "valid": False,
                    "message": "Mã giảm giá không tồn tại hoặc đã hết hiệu lực.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.now().date()
        if promo.start_date > today or promo.end_date < today:
            return Response(
                {
                    "valid": False,
                    "message": "Mã giảm giá chưa đến hoặc đã hết hạn sử dụng.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if promo.usage_limit is not None and promo.used_count >= promo.usage_limit:
            return Response(
                {"valid": False, "message": "Mã giảm giá đã được sử dụng hết lượt."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order_value < int(promo.min_order_value):
            return Response(
                {
                    "valid": False,
                    "message": f"Đơn hàng tối thiểu {int(promo.min_order_value):,}đ để áp dụng mã này.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if promo.discount_type == Promotion.DISCOUNT_PERCENT:
            discount = int(order_value * int(promo.discount_value) / 100)
        else:
            discount = int(promo.discount_value)

        discount = min(discount, order_value)

        return Response(
            {
                "valid": True,
                "code": promo.code,
                "discount_amount": discount,
                "message": f"Áp dụng thành công! Giảm {int(promo.discount_value)}{'%' if promo.discount_type == 'percent' else 'đ'}",
            }
        )
