from decimal import Decimal

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_SHIPPING = "shipping"
    STATUS_DELIVERED = "delivered"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_SHIPPING, "Shipping"),
        (STATUS_DELIVERED, "Delivered"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    PAYMENT_COD = "cod"
    PAYMENT_VNPAY = "vnpay"
    PAYMENT_MOMO = "momo"
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_COD, "COD"),
        (PAYMENT_VNPAY, "VNPay"),
        (PAYMENT_MOMO, "MoMo"),
    ]

    PAYMENT_UNPAID = "unpaid"
    PAYMENT_PAID = "paid"
    PAYMENT_REFUNDED = "refunded"
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_UNPAID, "Unpaid"),
        (PAYMENT_PAID, "Paid"),
        (PAYMENT_REFUNDED, "Refunded"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders",
        null=True,
        blank=True,
    )
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_COD,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_UNPAID,
    )
    receiver_name = models.CharField(max_length=150)
    receiver_phone = models.CharField(max_length=30)
    receiver_address = models.TextField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=0, default=0
    )
    promotion_code = models.CharField(max_length=50, blank=True, default="")
    note = models.TextField(blank=True)
    vnpay_txn_ref = models.CharField(max_length=100, null=True, blank=True)
    momo_txn_ref = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number or "Unsaved order"

    @classmethod
    def generate_order_number(cls):
        year = timezone.localdate().year
        prefix = f"DM{year}"

        with transaction.atomic():
            last_order = (
                cls.objects.select_for_update()
                .filter(order_number__startswith=prefix)
                .order_by("-order_number")
                .first()
            )
            next_sequence = 1
            if last_order and last_order.order_number:
                next_sequence = int(last_order.order_number.replace(prefix, "")) + 1
            return f"{prefix}{next_sequence:04d}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=220)
    product_price = models.DecimalField(max_digits=12, decimal_places=0)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    @property
    def subtotal(self):
        return Decimal(self.quantity) * self.product_price


class Promotion(models.Model):
    DISCOUNT_PERCENT = "percent"
    DISCOUNT_FIXED = "fixed"
    DISCOUNT_TYPE_CHOICES = [
        (DISCOUNT_PERCENT, "Percent"),
        (DISCOUNT_FIXED, "Fixed amount"),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=12, decimal_places=0)
    min_order_value = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-start_date", "code"]

    def __str__(self):
        return self.code
