from django.core.management.base import BaseCommand
from django.db import transaction

from apps.contact.models import SiteConfig
from apps.news.models import Article
from apps.products.models import Category, Plant, Product


CATEGORY_TRANSLATIONS = [
    {
        "name": "Thuốc BVTV",
        "slug": "thuoc-bvtv",
        "name_en": "Pesticides",
    },
    {
        "name": "Phân bón",
        "slug": "phan-bon",
        "name_en": "Fertilizers",
    },
    {
        "name": "Hạt giống",
        "slug": "hat-giong",
        "name_en": "Seeds",
    },
    {
        "name": "Thiết bị nông nghiệp",
        "slug": "thiet-bi-nong-nghiep",
        "name_en": "Agricultural Equipment",
    },
    {
        "name": "Dinh dưỡng cây trồng",
        "slug": "dinh-duong-cay-trong",
        "name_en": "Crop Nutrition",
    },
    {
        "name": "Chế phẩm sinh học",
        "slug": "che-pham-sinh-hoc",
        "name_en": "Biological Products",
    },
    {
        "name": "Máy & Thiết Bị",
        "slug": "may-thiet-bi",
        "name_en": "Agricultural Equipment",
    },
    {
        "name": "Kích Thích Sinh Trưởng",
        "slug": "kich-thich-sinh-truong",
        "name_en": "Plant Growth Regulators",
    },
    {
        "name": "Thuốc Trừ Bệnh",
        "slug": "thuoc-tru-benh",
        "name_en": "Fungicides",
    },
    {
        "name": "Thuốc Trừ Nhuyễn Thể",
        "slug": "thuoc-tru-nhuyen-the",
        "name_en": "Molluscicides",
    },
    {
        "name": "Thuốc Trừ Sâu",
        "slug": "thuoc-tru-sau",
        "name_en": "Insecticides",
    },
    {
        "name": "Thuốc Trừ Tuyến Trùng",
        "slug": "thuoc-tru-tuyen-trung",
        "name_en": "Nematicides",
    },
]


PLANT_TRANSLATIONS = [
    {"name": "Lúa", "slug": "lua", "name_en": "Rice"},
    {"name": "Cà phê", "slug": "ca-phe", "name_en": "Coffee"},
    {"name": "Hồ tiêu", "slug": "ho-tieu", "name_en": "Pepper"},
    {"name": "Tiêu", "slug": "tieu", "name_en": "Pepper"},
    {"name": "Cây ăn trái", "slug": "cay-an-trai", "name_en": "Fruit Trees"},
    {"name": "Rau màu", "slug": "rau-mau", "name_en": "Vegetables"},
    {"name": "Cao su", "slug": "cao-su", "name_en": "Rubber"},
    {"name": "Mía", "slug": "mia", "name_en": "Sugarcane"},
    {"name": "Hoa màu", "slug": "hoa-mau", "name_en": "Field Crops"},
    {"name": "Điều", "slug": "ieu", "name_en": "Cashew"},
]


PRODUCT_TRANSLATIONS = {
    "may-phun-thuoc-ien-16l": (
        "16L Electric Sprayer",
        "A 16-liter electric sprayer for efficient crop protection applications.",
    ),
    "binh-phun-eo-vai-20l": (
        "20L Shoulder Sprayer",
        "A durable 20-liter shoulder sprayer for farm and garden use.",
    ),
    "may-sa-lua-hang-mini": (
        "Mini Row Rice Seeder",
        "A compact rice seeder designed for small and medium paddy fields.",
    ),
    "auxin-10sl": (
        "Auxin 10SL",
        "A plant growth regulator that supports rooting, tillering, and fruit set.",
    ),
    "ga3-10-sl": (
        "GA3 10% SL",
        "A gibberellic acid solution that promotes cell growth and fruit development.",
    ),
    "sieu-ra-hoa-30ml": (
        "Flower Booster 30ml",
        "A flowering stimulant that helps crops bloom more evenly and abundantly.",
    ),
    "anvil-5sc": (
        "Anvil 5SC",
        "A fungicide for controlling key rice diseases such as blast and grain discoloration.",
    ),
    "carbenzim-500fl": (
        "Carbenzim 500FL",
        "A broad-spectrum systemic fungicide with fast leaf absorption.",
    ),
    "mancozeb-80wp": (
        "Mancozeb 80WP",
        "A contact fungicide that protects leaf surfaces against many fungal diseases.",
    ),
    "deadline-5g": (
        "Deadline 5G",
        "A granular molluscicide for effective golden apple snail control in rice fields.",
    ),
    "bolis-6gr": (
        "Bolis 6GR",
        "A granular product for fast snail and slug control in wet fields.",
    ),
    "regent-800wg": (
        "Regent 800WG",
        "An insecticide for controlling stem borers, brown planthoppers, and thrips.",
    ),
    "actara-25wg": (
        "Actara 25WG",
        "A systemic insecticide for long-lasting control of sucking pests.",
    ),
    "abamectin-36ec": (
        "Abamectin 3.6EC",
        "A broad-spectrum insecticide and miticide for vegetables and fruit trees.",
    ),
    "tervigo-020sc": (
        "Tervigo 020SC",
        "A nematicide for safe and effective root-zone nematode management.",
    ),
    "nimitz-480sc": (
        "Nimitz 480SC",
        "A modern nematicide with fast and lasting control of soil nematodes.",
    ),
}


ARTICLE_TRANSLATIONS = {
    "phong-tru-sau-keo-mua-thu-hai-ngo-hieu-qua": (
        "Effective Control of Fall Armyworm in Maize",
        "Fall armyworm is causing serious damage in many maize-growing areas, requiring timely and integrated control measures.",
    ),
    "bi-quyet-tang-nang-suat-lua-vu-he-thu-2026": (
        "Tips to Increase Rice Yield in the 2026 Summer-Autumn Crop",
        "Practical techniques can improve rice yields by 15-20%, including better water and nutrient management.",
    ),
    "ra-mat-dong-san-pham-kich-thich-sinh-truong-moi": (
        "New Plant Growth Regulator Product Line Launched",
        "Duoc Mua GAH introduces a new generation of growth regulators with strong performance on fruit trees.",
    ),
    "quan-ly-oc-buou-vang-tren-ruong-lua-sa": (
        "Managing Golden Apple Snails in Direct-Seeded Rice Fields",
        "A complete guide to golden apple snail prevention from land preparation through the tillering stage.",
    ),
    "gia-lua-gao-du-bao-tang-trong-quy-22026": (
        "Rice Prices Forecast to Rise in Q2 2026",
        "Vietnam's rice export market is expected to improve thanks to demand from Africa and the Middle East.",
    ),
    "cach-pha-thuoc-tru-sau-ung-ky-thuat-va-an-toan": (
        "How to Mix Pesticides Safely and Correctly",
        "The four-right principle helps improve pesticide effectiveness while reducing environmental risks.",
    ),
}


class Command(BaseCommand):
    help = "Seed English sample content for existing Duoc Mua records."

    def handle(self, *args, **options):
        with transaction.atomic():
            categories = self.seed_categories()
            plants = self.seed_plants()
            products = self.seed_products()
            articles = self.seed_articles()
            site_configs = SiteConfig.objects.update(
                tagline_en=(
                    "Smart Solutions \u2013 Unique Products \u2013 Professional Service"
                ),
                about_en=(
                    "Duoc Mua GAH is a leading agricultural solutions provider "
                    "in Vietnam."
                ),
            )

        self.stdout.write(
            self.style.SUCCESS(
                "English seed completed: "
                f"categories={categories}, "
                f"plants={plants}, "
                f"products={products}, "
                f"articles={articles}, "
                f"site_configs={site_configs} updated."
            )
        )

    def seed_categories(self):
        touched_ids = set()
        for item in CATEGORY_TRANSLATIONS:
            queryset = Category.objects.filter(slug=item["slug"])
            if not queryset.exists():
                queryset = Category.objects.filter(name=item["name"])
            if not queryset.exists():
                queryset = Category.objects.filter(name__icontains=item["name"])

            ids = list(queryset.values_list("id", flat=True))
            if ids:
                Category.objects.filter(id__in=ids).update(name_en=item["name_en"])
                touched_ids.update(ids)
        return len(touched_ids)

    def seed_plants(self):
        touched_ids = set()
        for item in PLANT_TRANSLATIONS:
            queryset = Plant.objects.filter(slug=item["slug"])
            if not queryset.exists():
                queryset = Plant.objects.filter(name=item["name"])
            if not queryset.exists():
                queryset = Plant.objects.filter(name__icontains=item["name"])

            ids = list(queryset.values_list("id", flat=True))
            if ids:
                Plant.objects.filter(id__in=ids).update(name_en=item["name_en"])
                touched_ids.update(ids)
        return len(touched_ids)

    def seed_products(self):
        count = 0
        for product in Product.objects.all():
            name_en, short_desc_en = PRODUCT_TRANSLATIONS.get(
                product.slug,
                (
                    self.simple_product_name(product.name),
                    f"{self.simple_product_name(product.name)} for modern farming needs.",
                ),
            )
            count += Product.objects.filter(pk=product.pk).update(
                name_en=name_en,
                short_desc_en=short_desc_en,
            )
        return count

    def seed_articles(self):
        count = 0
        for article in Article.objects.all():
            title_en, summary_en = ARTICLE_TRANSLATIONS.get(
                article.slug,
                (
                    self.simple_article_title(article.title),
                    "Agricultural guidance and market insights for Vietnamese farmers.",
                ),
            )
            count += Article.objects.filter(pk=article.pk).update(
                title_en=title_en,
                summary_en=summary_en,
            )
        return count

    def simple_product_name(self, value):
        return value.replace("Thuốc", "Crop Protection").replace("Máy", "Machine")

    def simple_article_title(self, value):
        return value.replace("Kỹ thuật", "Techniques")
