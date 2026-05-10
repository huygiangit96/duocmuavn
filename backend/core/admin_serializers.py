from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.contact.models import Banner, ContactSubmission, SiteConfig
from apps.documents.models import DocCategory, Document
from apps.news.models import Article, Hashtag, NewsCategory
from apps.orders.models import Order, OrderItem, Promotion
from apps.products.models import Category, Plant, Product, ProductReview


User = get_user_model()


class AdminCategorySerializer(serializers.ModelSerializer):
    name_en = serializers.CharField(required=False, allow_blank=True)
    description_en = serializers.CharField(required=False, allow_blank=True)
    product_count = serializers.IntegerField(source="products.count", read_only=True)

    class Meta:
        model = Category
        fields = "__all__"


class AdminPlantSerializer(serializers.ModelSerializer):
    name_en = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Plant
        fields = "__all__"


class AdminProductSerializer(serializers.ModelSerializer):
    name_en = serializers.CharField(required=False, allow_blank=True)
    short_desc_en = serializers.CharField(required=False, allow_blank=True)
    description_en = serializers.CharField(required=False, allow_blank=True)
    specs_en = serializers.JSONField(required=False)

    class Meta:
        model = Product
        fields = "__all__"


class AdminOrderItemSerializer(serializers.ModelSerializer):
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


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "user_email",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "receiver_name",
            "receiver_phone",
            "receiver_address",
            "subtotal",
            "shipping_fee",
            "total",
            "note",
            "vnpay_txn_ref",
            "momo_txn_ref",
            "created_at",
            "updated_at",
            "items",
        )


class AdminPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"


class AdminProductReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ProductReview
        fields = (
            "id",
            "product",
            "product_name",
            "user",
            "user_email",
            "rating",
            "text",
            "status",
            "created_at",
        )


class AdminUserSerializer(serializers.ModelSerializer):
    firebase_uid = serializers.CharField(source="profile.firebase_uid", read_only=True)
    order_count = serializers.IntegerField(source="orders.count", read_only=True)
    recent_orders = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "date_joined",
            "firebase_uid",
            "order_count",
            "recent_orders",
        )
        read_only_fields = ("id", "username", "date_joined")

    def get_recent_orders(self, obj):
        return AdminOrderSerializer(
            obj.orders.order_by("-created_at")[:5],
            many=True,
        ).data


class AdminNewsCategorySerializer(serializers.ModelSerializer):
    name_en = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = NewsCategory
        fields = "__all__"


class AdminHashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = "__all__"


class AdminArticleSerializer(serializers.ModelSerializer):
    title_en = serializers.CharField(required=False, allow_blank=True)
    summary_en = serializers.CharField(required=False, allow_blank=True)
    content_en = serializers.CharField(required=False, allow_blank=True)
    thumbnail = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Article
        fields = "__all__"


class AdminDocCategorySerializer(serializers.ModelSerializer):
    name_en = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = DocCategory
        fields = "__all__"


class AdminDocumentSerializer(serializers.ModelSerializer):
    title_en = serializers.CharField(required=False, allow_blank=True)
    summary_en = serializers.CharField(required=False, allow_blank=True)
    content_en = serializers.CharField(required=False, allow_blank=True)
    file_url = serializers.CharField(source="file", required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Document
        fields = "__all__"


class AdminBannerSerializer(serializers.ModelSerializer):
    title_en = serializers.CharField(required=False, allow_blank=True)
    subtitle_en = serializers.CharField(required=False, allow_blank=True)
    image_url = serializers.CharField(source="image", required=False, allow_blank=True)
    link_url = serializers.CharField(source="link", required=False, allow_blank=True)
    sort_order = serializers.IntegerField(source="order", required=False)
    location = serializers.CharField(required=False, allow_blank=True, default="home")

    class Meta:
        model = Banner
        fields = "__all__"


class AdminContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = "__all__"


class AdminSiteConfigSerializer(serializers.ModelSerializer):
    tagline = serializers.CharField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    tagline_en = serializers.CharField(required=False, allow_blank=True)
    about_en = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = SiteConfig
        fields = "__all__"


class AdminStatsSerializer(serializers.Serializer):
    orders = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=0)
    customers = serializers.IntegerField()
    products = serializers.IntegerField()
    recent_orders = AdminOrderSerializer(many=True)
    new_users = AdminUserSerializer(many=True)
    orders_by_status = serializers.DictField(child=serializers.IntegerField())
