from django.conf import settings
from django.shortcuts import redirect
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order

from .momo import create_payment as create_momo_payment
from .momo import verify_ipn
from .vnpay import create_payment_url, verify_return


class VNPayCreateSerializer(serializers.Serializer):
    order_number = serializers.CharField()


class PaymentURLSerializer(serializers.Serializer):
    payment_url = serializers.URLField()


class MoMoIPNSerializer(serializers.Serializer):
    orderId = serializers.CharField(required=False, allow_blank=True)
    resultCode = serializers.CharField(required=False, allow_blank=True)
    signature = serializers.CharField(required=False, allow_blank=True)


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "127.0.0.1")


class VNPayCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        request=VNPayCreateSerializer,
        responses={200: PaymentURLSerializer},
    )
    def post(self, request):
        serializer = VNPayCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data["order_number"]

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.payment_status == Order.PAYMENT_PAID:
            return Response(
                {"detail": "Order has already been paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return_url = request.build_absolute_uri("/api/payments/vnpay/return/")
        payment_url = create_payment_url(
            order_number=order.order_number,
            amount=order.total,
            order_info=f"Thanh toan don hang {order.order_number}",
            return_url=return_url,
            ip_addr=get_client_ip(request),
        )
        return Response({"payment_url": payment_url})


class VNPayReturnView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    @extend_schema(responses={302: OpenApiResponse(description="Redirect to frontend")})
    def get(self, request):
        params = request.GET.dict()
        order_number = params.get("vnp_TxnRef", "")
        is_valid = verify_return(params)
        is_success = is_valid and params.get("vnp_ResponseCode") == "00"

        if order_number and is_success:
            Order.objects.filter(order_number=order_number).update(
                payment_status=Order.PAYMENT_PAID,
            )

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        status_value = "success" if is_success else "failed"
        return redirect(
            f"{frontend_url}/thanh-toan/xac-nhan?order={order_number}&status={status_value}"
        )


class MoMoCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        request=VNPayCreateSerializer,
        responses={200: PaymentURLSerializer},
    )
    def post(self, request):
        serializer = VNPayCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data["order_number"]

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.payment_status == Order.PAYMENT_PAID:
            return Response(
                {"detail": "Order has already been paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return_url = request.build_absolute_uri("/api/payments/momo/return/")
        notify_url = request.build_absolute_uri("/api/payments/momo/ipn/")
        payment_url = create_momo_payment(
            order_number=order.order_number,
            amount=order.total,
            order_info=f"Thanh toan don hang {order.order_number}",
            return_url=return_url,
            notify_url=notify_url,
            ip_addr=get_client_ip(request),
        )

        if not payment_url:
            return Response(
                {"detail": "MoMo did not return a payment URL."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"payment_url": payment_url})


class MoMoIPNView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    @extend_schema(
        request=MoMoIPNSerializer,
        responses={204: OpenApiResponse(description="No content")},
    )
    def post(self, request):
        params = request.data.dict() if hasattr(request.data, "dict") else dict(request.data)
        if verify_ipn(params) and str(params.get("resultCode")) == "0":
            order_number = params.get("orderId", "")
            if order_number:
                Order.objects.filter(order_number=order_number).update(
                    payment_status=Order.PAYMENT_PAID,
                )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MoMoReturnView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    @extend_schema(responses={302: OpenApiResponse(description="Redirect to frontend")})
    def get(self, request):
        order_number = request.GET.get("orderId", "")
        result_code = request.GET.get("resultCode", "")
        status_value = "success" if str(result_code) == "0" else "failed"
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        return redirect(
            f"{frontend_url}/thanh-toan/xac-nhan?order={order_number}&status={status_value}"
        )
