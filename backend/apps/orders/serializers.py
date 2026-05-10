from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.products.models import Product

from .models import Order, OrderItem, Promotion


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_price",
            "quantity",
            "subtotal",
        )
        read_only_fields = ("id", "product_name", "product_price", "subtotal")


class OrderCreateItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True)
    )
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderCreateItemSerializer(many=True, write_only=True)
    promotion_code = serializers.CharField(
        required=False, allow_blank=True, default=""
    )

    class Meta:
        model = Order
        fields = (
            "order_number",
            "payment_method",
            "receiver_name",
            "receiver_phone",
            "receiver_address",
            "note",
            "promotion_code",
            "items",
        )
        read_only_fields = ("order_number",)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value

    def validate_payment_method(self, value):
        valid_methods = {choice[0] for choice in Order.PAYMENT_METHOD_CHOICES}
        if value not in valid_methods:
            raise serializers.ValidationError("Invalid payment method.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        subtotal = Decimal("0")
        prepared_items = []
        for item in items_data:
            product = item["product"]
            quantity = item["quantity"]
            unit_price = product.sale_price or product.price
            line_subtotal = Decimal(quantity) * unit_price
            subtotal += line_subtotal
            prepared_items.append((product, quantity, unit_price))

        shipping_fee = Decimal("0") if subtotal >= Decimal("500000") else Decimal("30000")

        promotion_code = validated_data.pop("promotion_code", "") or ""
        discount_amount = Decimal("0")

        if promotion_code:
            try:
                promo = Promotion.objects.get(
                    code__iexact=promotion_code,
                    is_active=True,
                    start_date__lte=timezone.now().date(),
                    end_date__gte=timezone.now().date(),
                )
                if promo.usage_limit is None or promo.used_count < promo.usage_limit:
                    if subtotal >= promo.min_order_value:
                        if promo.discount_type == Promotion.DISCOUNT_PERCENT:
                            discount_amount = (
                                subtotal * Decimal(promo.discount_value) / 100
                            ).quantize(Decimal("1"))
                        else:
                            discount_amount = Decimal(promo.discount_value)
                        discount_amount = min(discount_amount, subtotal)
                        Promotion.objects.filter(pk=promo.pk).update(
                            used_count=promo.used_count + 1
                        )
            except Promotion.DoesNotExist:
                pass

        total = subtotal + shipping_fee - discount_amount

        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            discount_amount=discount_amount,
            promotion_code=promotion_code.upper() if promotion_code else "",
            total=total,
            **validated_data,
        )

        for product, quantity, unit_price in prepared_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=unit_price,
                quantity=quantity,
            )

        return order


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "receiver_name",
            "receiver_phone",
            "receiver_address",
            "subtotal",
            "shipping_fee",
            "discount_amount",
            "promotion_code",
            "total",
            "note",
            "vnpay_txn_ref",
            "momo_txn_ref",
            "created_at",
            "updated_at",
            "items",
        )
