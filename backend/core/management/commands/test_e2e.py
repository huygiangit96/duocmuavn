from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework.test import APIClient

from apps.accounts.models import Address, Commune, UserProfile
from apps.contact.models import ContactSubmission
from apps.documents.models import Document
from apps.news.models import Article
from apps.orders.models import Order
from apps.products.models import Product


class Command(BaseCommand):
    help = "Run end-to-end API flow for Duoc Mua purchase journey."

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-data",
            action="store_true",
            help="Do not clean generated e2e data before running.",
        )

    def handle(self, *args, **options):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")

        self.passed = 0
        self.failed = 0
        self.failures = []

        self.User = get_user_model()
        self.client = APIClient()
        self.admin_client = APIClient()
        self.test_user = None
        self.staff_user = None
        self.products = []
        self.cancelled_order_number = ""
        self.admin_order_number = ""

        if not options["keep_data"]:
            self.cleanup_previous_run()

        self.run_case("1. Create test user and force_authenticate", self.create_users)
        self.run_case("2. Home featured products", self.home_featured_products)
        self.run_case("3. Product list", self.product_list)
        self.run_case("4. Product detail", self.product_detail)
        self.run_case("5. News list", self.news_list)
        self.run_case("6. Document list", self.document_list)
        self.run_case("7. Create COD order with 2 items", self.create_cod_order)
        self.run_case("8. Order list", self.order_list)
        self.run_case("9. Order detail", self.order_detail)
        self.run_case("10. Cancel order", self.cancel_order)
        self.run_case("11. Create second order for admin", self.create_admin_test_order)
        self.run_case("12. Profile get", self.profile_get)
        self.run_case("13. Profile update", self.profile_update)
        self.run_case("14. Create address", self.create_address)
        self.run_case("15. Submit contact form", self.submit_contact)
        self.run_case("16. Admin stats", self.admin_stats)
        self.run_case("17. Admin update order status", self.admin_update_order_status)
        self.run_case("18. Admin export Excel", self.admin_export_orders)

        self.stdout.write("")
        self.stdout.write(f"TOTAL: passed={self.passed}, failed={self.failed}")
        if self.failures:
            self.stdout.write(self.style.ERROR("Failures:"))
            for failure in self.failures:
                self.stdout.write(self.style.ERROR(f"- {failure}"))

        if self.failed:
            raise SystemExit(1)

    def cleanup_previous_run(self):
        users = self.User.objects.filter(username__in=["e2e-user", "e2e-staff"])
        Order.objects.filter(user__in=users).delete()
        Address.objects.filter(user__in=users).delete()
        UserProfile.objects.filter(user__in=users).delete()
        ContactSubmission.objects.filter(email__in=["e2e-user@example.com", "e2e-contact@example.com"]).delete()

    def run_case(self, name, func):
        try:
            message = func()
        except Exception as exc:
            self.failed += 1
            detail = f"{name}: {exc}"
            self.failures.append(detail)
            self.stdout.write(self.style.ERROR(f"FAIL - {detail}"))
            return

        self.passed += 1
        suffix = f" - {message}" if message else ""
        self.stdout.write(self.style.SUCCESS(f"PASS - {name}{suffix}"))

    def assert_true(self, condition, message):
        if not condition:
            raise AssertionError(message)

    def assert_status(self, response, status_code, message=None):
        if response.status_code != status_code:
            detail = getattr(response, "data", None)
            if detail is None:
                detail = getattr(response, "content", b"")[:300]
            raise AssertionError(
                message
                or f"Expected HTTP {status_code}, got {response.status_code}: {detail}"
            )

    def get_results(self, data):
        if isinstance(data, list):
            return data
        return data.get("results", [])

    def get_count(self, data):
        if isinstance(data, list):
            return len(data)
        return data.get("count", len(data.get("results", [])))

    def create_users(self):
        self.test_user, _ = self.User.objects.update_or_create(
            username="e2e-user",
            defaults={
                "email": "e2e-user@example.com",
                "first_name": "E2E User",
                "is_active": True,
                "is_staff": False,
            },
        )
        self.staff_user, _ = self.User.objects.update_or_create(
            username="e2e-staff",
            defaults={
                "email": "e2e-staff@example.com",
                "first_name": "E2E Staff",
                "is_active": True,
                "is_staff": True,
            },
        )
        self.client.force_authenticate(user=self.test_user)
        self.admin_client.force_authenticate(user=self.staff_user)
        return f"user={self.test_user.email}, staff={self.staff_user.email}"

    def home_featured_products(self):
        response = self.client.get("/api/products/?ordering=-sale_count&page_size=8")
        self.assert_status(response, 200)
        self.assert_true(len(self.get_results(response.data)) > 0, "Featured products returned no results.")
        return f"results={len(self.get_results(response.data))}"

    def product_list(self):
        response = self.client.get("/api/products/")
        self.assert_status(response, 200)
        count = self.get_count(response.data)
        self.assert_true(count > 0, "Product count must be > 0.")
        self.products = list(Product.objects.filter(is_active=True).order_by("id")[:2])
        self.assert_true(len(self.products) >= 2, "Need at least 2 active products.")
        return f"count={count}"

    def product_detail(self):
        product = self.products[0]
        response = self.client.get(f"/api/products/{product.slug}/")
        self.assert_status(response, 200)
        self.assert_true(response.data["slug"] == product.slug, "Product slug mismatch.")
        return f"slug={product.slug}"

    def news_list(self):
        response = self.client.get("/api/news/")
        self.assert_status(response, 200)
        count = self.get_count(response.data)
        self.assert_true(count > 0, "News count must be > 0.")
        self.assert_true(Article.objects.filter(is_published=True).exists(), "Published article missing.")
        return f"count={count}"

    def document_list(self):
        response = self.client.get("/api/documents/")
        self.assert_status(response, 200)
        count = self.get_count(response.data)
        self.assert_true(count > 0, "Document count must be > 0.")
        self.assert_true(Document.objects.filter(is_published=True).exists(), "Published document missing.")
        return f"count={count}"

    def create_order_payload(self, suffix):
        return {
            "payment_method": "cod",
            "receiver_name": f"E2E Receiver {suffix}",
            "receiver_phone": "0901234567",
            "receiver_address": "123 Test Street, Test Commune, Test Province",
            "note": f"E2E order {suffix}",
            "items": [
                {"product": self.products[0].id, "quantity": 1},
                {"product": self.products[1].id, "quantity": 1},
            ],
        }

    def expected_totals(self):
        subtotal = sum(
            Decimal(product.sale_price if product.sale_price is not None else product.price)
            for product in self.products
        )
        shipping_fee = Decimal("0") if subtotal >= Decimal("500000") else Decimal("30000")
        return subtotal, shipping_fee, subtotal + shipping_fee

    def create_cod_order(self):
        response = self.client.post("/api/orders/", self.create_order_payload("cancel"), format="json")
        self.assert_status(response, 201)
        self.cancelled_order_number = response.data["order_number"]
        subtotal, shipping_fee, total = self.expected_totals()
        self.assert_true(bool(self.cancelled_order_number), "Missing order_number.")
        self.assert_true(Decimal(response.data["shipping_fee"]) == shipping_fee, "Shipping fee mismatch.")
        self.assert_true(Decimal(response.data["total"]) == total, "Total mismatch.")
        return f"order={self.cancelled_order_number}, total={response.data['total']}"

    def order_list(self):
        response = self.client.get("/api/orders/")
        self.assert_status(response, 200)
        count = self.get_count(response.data)
        self.assert_true(count == 1, f"Expected 1 order, got {count}.")
        return f"count={count}"

    def order_detail(self):
        response = self.client.get(f"/api/orders/{self.cancelled_order_number}/")
        self.assert_status(response, 200)
        self.assert_true(response.data["order_number"] == self.cancelled_order_number, "Order detail mismatch.")
        return f"order={self.cancelled_order_number}"

    def cancel_order(self):
        response = self.client.post(f"/api/orders/{self.cancelled_order_number}/cancel/")
        self.assert_status(response, 200)
        self.assert_true(response.data["status"] == Order.STATUS_CANCELLED, "Order not cancelled.")
        return f"status={response.data['status']}"

    def create_admin_test_order(self):
        response = self.client.post("/api/orders/", self.create_order_payload("admin"), format="json")
        self.assert_status(response, 201)
        self.admin_order_number = response.data["order_number"]
        self.assert_true(bool(self.admin_order_number), "Missing admin test order_number.")
        return f"order={self.admin_order_number}"

    def profile_get(self):
        response = self.client.get("/api/account/profile/")
        self.assert_status(response, 200)
        self.assert_true("email" in response.data, "Profile missing email.")
        return f"email={response.data.get('email')}"

    def profile_update(self):
        response = self.client.put(
            "/api/account/profile/",
            {"name": "E2E Updated User", "phone": "0901234567"},
            format="json",
        )
        self.assert_status(response, 200)
        self.assert_true(response.data["name"] == "E2E Updated User", "Profile name not updated.")
        return f"name={response.data['name']}"

    def create_address(self):
        commune = Commune.objects.select_related("province").first()
        self.assert_true(commune is not None, "No commune data available.")
        response = self.client.post(
            "/api/account/addresses/",
            {
                "label": "Nhà E2E",
                "receiver_name": "E2E Receiver",
                "phone": "0901234567",
                "address_line": "123 Test Street",
                "province": commune.province_id,
                "commune": commune.id,
                "is_default": True,
            },
            format="json",
        )
        self.assert_status(response, 201)
        self.assert_true(response.data["is_default"] is True, "Address should be default.")
        return f"address_id={response.data['id']}"

    def submit_contact(self):
        response = APIClient().post(
            "/api/contact/",
            {
                "name": "E2E Contact",
                "phone": "0901234567",
                "email": "e2e-contact@example.com",
                "message": "E2E contact submission",
            },
            format="json",
        )
        self.assert_status(response, 201)
        return f"contact_id={response.data['id']}"

    def admin_stats(self):
        response = self.admin_client.get("/api/admin/stats/")
        self.assert_status(response, 200)
        self.assert_true("orders" in response.data, "Admin stats missing orders.")
        self.assert_true("revenue" in response.data, "Admin stats missing revenue.")
        return f"orders={response.data['orders']}, revenue={response.data['revenue']}"

    def admin_update_order_status(self):
        response = self.admin_client.patch(
            f"/api/admin/orders/{self.admin_order_number}/status/",
            {"status": Order.STATUS_CONFIRMED},
            format="json",
        )
        self.assert_status(response, 200)
        self.assert_true(response.data["status"] == Order.STATUS_CONFIRMED, "Admin order status not updated.")
        return f"order={self.admin_order_number}, status={response.data['status']}"

    def admin_export_orders(self):
        response = self.admin_client.get("/api/admin/orders/export/")
        self.assert_status(response, 200)
        content_type = response.headers.get("Content-Type", "")
        expected = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        self.assert_true(expected in content_type, f"Unexpected Content-Type: {content_type}")
        self.assert_true(len(response.content) > 0, "Export file is empty.")
        return f"content_type={content_type}, bytes={len(response.content)}"
