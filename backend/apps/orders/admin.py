from django.contrib import admin

from .models import Order, OrderItem, Promotion


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product", "product_name", "product_price", "quantity", "line_subtotal")
    readonly_fields = ("line_subtotal",)

    @admin.display(description="Subtotal")
    def line_subtotal(self, obj):
        if not obj.pk:
            return "-"
        return obj.subtotal


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "receiver_name",
        "receiver_phone",
        "status",
        "payment_method",
        "payment_status",
        "subtotal",
        "shipping_fee",
        "total",
        "created_at",
    )
    list_filter = ("status", "payment_method", "payment_status", "created_at")
    search_fields = (
        "order_number",
        "receiver_name",
        "receiver_phone",
        "receiver_address",
        "vnpay_txn_ref",
        "momo_txn_ref",
    )
    readonly_fields = ("order_number", "created_at", "updated_at")
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "product_price", "quantity", "subtotal")
    search_fields = ("order__order_number", "product_name")
    list_filter = ("order__status",)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "discount_type",
        "discount_value",
        "min_order_value",
        "start_date",
        "end_date",
        "usage_limit",
        "used_count",
        "is_active",
    )
    list_filter = ("discount_type", "is_active", "start_date", "end_date")
    search_fields = ("code", "name")
