from datetime import date, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.test import APIClient

from apps.contact.models import Banner, SiteConfig
from apps.documents.models import DocCategory, Document
from apps.news.models import Article, NewsCategory
from apps.orders.models import Promotion
from apps.products.models import Category, Plant, Product, ProductReview


class Command(BaseCommand):
    help = "Run Admin CMS API test suite."

    def handle(self, *args, **options):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")

        self.passed = 0
        self.failed = 0
        self.failures = []
        self.User = get_user_model()
        self.client = APIClient()
        self.user_client = APIClient()
        self.staff_user = None
        self.normal_user = None
        self.category = None
        self.news_category = None
        self.doc_category = None
        self.plant = None
        self.product_slug = "e2e-admin-product"
        self.article_slug = "e2e-admin-article"
        self.document_slug = "e2e-admin-document"
        self.promotion_id = None
        self.review_id = None

        self.cleanup_previous_run()
        self.bootstrap()

        self.run_case("1. CRUD products", self.crud_products)
        self.run_case("2. CRUD news", self.crud_news)
        self.run_case("3. CRUD documents", self.crud_documents)
        self.run_case("4. Manage reviews", self.manage_reviews)
        self.run_case("5. Manage users", self.manage_users)
        self.run_case("6. Promotions", self.manage_promotions)
        self.run_case("7. Site config", self.manage_site_config)
        self.run_case("8. Banners", self.list_banners)
        self.run_case("9. Normal user forbidden", self.normal_user_forbidden)

        self.stdout.write("")
        self.stdout.write(f"TOTAL: passed={self.passed}, failed={self.failed}")
        if self.failures:
            self.stdout.write(self.style.ERROR("Failures:"))
            for failure in self.failures:
                self.stdout.write(self.style.ERROR(f"- {failure}"))
        if self.failed:
            raise SystemExit(1)

    def cleanup_previous_run(self):
        Product.objects.filter(slug=self.product_slug).delete()
        Article.objects.filter(slug=self.article_slug).delete()
        Document.objects.filter(slug=self.document_slug).delete()
        Promotion.objects.filter(code="E2EADMIN").delete()
        ProductReview.objects.filter(text__startswith="E2E admin review").delete()

    def bootstrap(self):
        self.staff_user, _ = self.User.objects.update_or_create(
            username="admin-cms-staff",
            defaults={
                "email": "admin-cms-staff@example.com",
                "first_name": "Admin CMS",
                "is_active": True,
                "is_staff": True,
            },
        )
        self.normal_user, _ = self.User.objects.update_or_create(
            username="admin-cms-user",
            defaults={
                "email": "admin-cms-user@example.com",
                "first_name": "Normal User",
                "is_active": True,
                "is_staff": False,
            },
        )
        self.client.force_authenticate(user=self.staff_user)
        self.user_client.force_authenticate(user=self.normal_user)

        self.category = Category.objects.first()
        self.news_category = NewsCategory.objects.first()
        self.doc_category = DocCategory.objects.first()
        self.plant = Plant.objects.first()

        if not self.category:
            self.category = Category.objects.create(name="E2E Category", slug="e2e-category")
        if not self.news_category:
            self.news_category = NewsCategory.objects.create(name="E2E News", slug="e2e-news")
        if not self.doc_category:
            self.doc_category = DocCategory.objects.create(name="E2E Docs", slug="e2e-docs")
        if not self.plant:
            self.plant = Plant.objects.create(name="E2E Plant", slug="e2e-plant")
        SiteConfig.objects.get_or_create(
            defaults={
                "hotline": "1800xxxx",
                "email": "admin@example.com",
                "address": "E2E Address",
            }
        )
        Banner.objects.get_or_create(
            title="E2E Banner",
            defaults={
                "subtitle": "Admin CMS banner",
                "link": "https://duocmua.local",
                "order": 99,
                "is_active": True,
            },
        )

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

    def assert_status(self, response, status_code):
        if response.status_code != status_code:
            detail = getattr(response, "data", None)
            if detail is None:
                detail = getattr(response, "content", b"")[:300]
            raise AssertionError(f"Expected HTTP {status_code}, got {response.status_code}: {detail}")

    def get_results(self, data):
        if isinstance(data, list):
            return data
        return data.get("results", [])

    def crud_products(self):
        payload = {
            "name": "E2E Admin Product",
            "slug": self.product_slug,
            "category": self.category.id,
            "plants": [self.plant.id],
            "tag": "Mới",
            "price": "120000",
            "sale_price": "99000",
            "specs": {"unit": "chai"},
            "description": "E2E product",
            "usage": "E2E usage",
            "guide": "E2E guide",
            "sale_count": 1,
            "is_active": True,
            "sort_order": 999,
        }
        response = self.client.post("/api/admin/products/", payload, format="json")
        self.assert_status(response, 201)
        response = self.client.get(f"/api/admin/products/{self.product_slug}/")
        self.assert_status(response, 200)
        response = self.client.patch(
            f"/api/admin/products/{self.product_slug}/",
            {"price": "150000"},
            format="json",
        )
        self.assert_status(response, 200)
        self.assert_true(response.data["price"] == "150000", "Product price was not updated.")
        response = self.client.delete(f"/api/admin/products/{self.product_slug}/")
        self.assert_status(response, 204)
        return f"slug={self.product_slug}"

    def crud_news(self):
        payload = {
            "title": "E2E Admin Article",
            "slug": self.article_slug,
            "category": self.news_category.id,
            "hashtags": [],
            "summary": "E2E summary",
            "content": "<p>E2E content</p>",
            "author": self.staff_user.id,
            "is_published": True,
            "published_at": timezone.now().isoformat(),
        }
        response = self.client.post("/api/admin/news/", payload, format="json")
        self.assert_status(response, 201)
        response = self.client.patch(
            f"/api/admin/news/{self.article_slug}/",
            {"summary": "E2E summary updated"},
            format="json",
        )
        self.assert_status(response, 200)
        self.assert_true(response.data["summary"] == "E2E summary updated", "Article summary not updated.")
        response = self.client.delete(f"/api/admin/news/{self.article_slug}/")
        self.assert_status(response, 204)
        return f"slug={self.article_slug}"

    def crud_documents(self):
        payload = {
            "title": "E2E Admin Document",
            "slug": self.document_slug,
            "doc_type": Document.TYPE_PAPER,
            "category": self.doc_category.id,
            "plants": [self.plant.id],
            "summary": "E2E document summary",
            "content": "E2E document content",
            "file": None,
            "video_url": None,
            "is_published": True,
        }
        response = self.client.post("/api/admin/documents/", payload, format="json")
        self.assert_status(response, 201)
        response = self.client.delete(f"/api/admin/documents/{self.document_slug}/")
        self.assert_status(response, 204)
        return f"slug={self.document_slug}"

    def manage_reviews(self):
        product = Product.objects.filter(is_active=True).first()
        self.assert_true(product is not None, "Need an active product for review test.")
        review = ProductReview.objects.create(
            product=product,
            user=self.normal_user,
            rating=5,
            text="E2E admin review approve/reject",
        )
        self.review_id = review.id
        response = self.client.get("/api/admin/reviews/")
        self.assert_status(response, 200)
        response = self.client.patch(f"/api/admin/reviews/{review.id}/approve/")
        self.assert_status(response, 200)
        self.assert_true(response.data["status"] == ProductReview.STATUS_APPROVED, "Review not approved.")
        response = self.client.patch(f"/api/admin/reviews/{review.id}/reject/")
        self.assert_status(response, 200)
        self.assert_true(response.data["status"] == ProductReview.STATUS_REJECTED, "Review not rejected.")
        return f"review_id={review.id}"

    def manage_users(self):
        response = self.client.get("/api/admin/users/")
        self.assert_status(response, 200)
        users = self.get_results(response.data)
        self.assert_true(len(users) > 0, "Admin users list is empty.")
        original_active = self.normal_user.is_active
        response = self.client.patch(f"/api/admin/users/{self.normal_user.id}/toggle-active/")
        self.assert_status(response, 200)
        self.normal_user.refresh_from_db()
        self.assert_true(self.normal_user.is_active != original_active, "User active status did not toggle.")
        self.normal_user.is_active = original_active
        self.normal_user.save(update_fields=["is_active"])
        return f"users={len(users)}"

    def manage_promotions(self):
        payload = {
            "code": "E2EADMIN",
            "name": "E2E Admin Promotion",
            "discount_type": "fixed",
            "discount_value": "10000",
            "min_order_value": "50000",
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=7)).isoformat(),
            "usage_limit": 10,
            "used_count": 0,
            "is_active": True,
        }
        response = self.client.post("/api/admin/promotions/", payload, format="json")
        self.assert_status(response, 201)
        self.promotion_id = response.data["id"]
        response = self.client.delete(f"/api/admin/promotions/{self.promotion_id}/")
        self.assert_status(response, 204)
        return f"promotion_id={self.promotion_id}"

    def manage_site_config(self):
        response = self.client.get("/api/admin/site-config/")
        self.assert_status(response, 200)
        configs = self.get_results(response.data)
        self.assert_true(len(configs) > 0, "No SiteConfig record exists.")
        config_id = configs[0]["id"]
        response = self.client.patch(
            f"/api/admin/site-config/{config_id}/",
            {"hotline": "1900 admin cms"},
            format="json",
        )
        self.assert_status(response, 200)
        self.assert_true(response.data["hotline"] == "1900 admin cms", "SiteConfig hotline not updated.")
        return f"site_config_id={config_id}"

    def list_banners(self):
        response = self.client.get("/api/admin/banners/")
        self.assert_status(response, 200)
        count = len(self.get_results(response.data))
        self.assert_true(count > 0, "No banners returned.")
        return f"banners={count}"

    def normal_user_forbidden(self):
        response = self.user_client.get("/api/admin/stats/")
        self.assert_status(response, 403)
        return "403 confirmed"
