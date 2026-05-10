import unicodedata
from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.documents.models import DocCategory, Document
from apps.news.models import Article, Hashtag, NewsCategory
from apps.products.models import Category, Plant, Product


CATS = [
    {"id": 1, "name": "Máy & Thiết Bị", "fullName": "Máy và Thiết Bị Nông Nghiệp", "color": "#1E5BAA"},
    {"id": 2, "name": "Kích Thích Sinh Trưởng", "fullName": "Thuốc Kích Thích Sinh Trưởng", "color": "#7a9820"},
    {"id": 3, "name": "Thuốc Trừ Bệnh", "fullName": "Thuốc Trừ Bệnh", "color": "#c0392b"},
    {"id": 4, "name": "Thuốc Trừ Nhuyễn Thể", "fullName": "Thuốc Trừ Nhuyễn Thể", "color": "#7b5ea7"},
    {"id": 5, "name": "Thuốc Trừ Sâu", "fullName": "Thuốc Trừ Sâu", "color": "#d35400"},
    {"id": 6, "name": "Thuốc Trừ Tuyến Trùng", "fullName": "Thuốc Trừ Tuyến Trùng", "color": "#0878a0"},
]

PLANTS = ["Lúa", "Rau màu", "Cây ăn trái", "Hoa màu", "Cà phê", "Tiêu", "Điều"]

PRODUCTS = [
    {"id": 1, "catId": 1, "name": "Máy Phun Thuốc Điện 16L", "price": 2500000, "listPrice": 2900000, "promo": "Giảm 14%", "unit": "cái", "tag": "Mới", "rating": 4.8, "reviews": 32, "plants": ["Lúa", "Rau màu"], "desc": "Máy phun điện dung tích 16L, pin lithium 12V/8Ah, thời gian phun 45-60 phút/lần sạc. Vòi phun điều chỉnh được."},
    {"id": 2, "catId": 1, "name": "Bình Phun Đeo Vai 20L", "price": 450000, "listPrice": 450000, "promo": "", "unit": "cái", "tag": "", "rating": 4.5, "reviews": 18, "plants": ["Lúa", "Cây ăn trái"], "desc": "Bình phun tay đeo vai 20L, van bơm áp lực cao, vòi phun đa chiều 360 độ."},
    {"id": 3, "catId": 1, "name": "Máy Sạ Lúa Hàng Mini", "price": 8500000, "listPrice": 9500000, "promo": "-1tr", "unit": "cái", "tag": "Bán chạy", "rating": 4.9, "reviews": 45, "plants": ["Lúa"], "desc": "Máy sạ lúa hàng mini, khoảng cách hàng 20-30cm, phù hợp ruộng diện tích nhỏ."},
    {"id": 4, "catId": 2, "name": "Auxin 10SL", "price": 85000, "listPrice": 110000, "promo": "Giảm 23%", "unit": "chai 100ml", "tag": "Bán chạy", "rating": 4.7, "reviews": 62, "plants": ["Lúa", "Rau màu", "Cây ăn trái"], "desc": "Kích thích ra rễ, đẻ nhánh, tăng tỷ lệ đậu trái. Thành phần: Alpha-naphthalene acetic acid 10%."},
    {"id": 5, "catId": 2, "name": "GA3 10% SL", "price": 120000, "listPrice": 120000, "promo": "", "unit": "chai 50ml", "tag": "", "rating": 4.6, "reviews": 38, "plants": ["Cây ăn trái", "Rau màu"], "desc": "Gibberellin A3 10SL, kích thích sinh trưởng tế bào, tăng kích thước quả và kéo dài cuống."},
    {"id": 6, "catId": 2, "name": "Siêu Ra Hoa 30ml", "price": 65000, "listPrice": 80000, "promo": "Giảm 19%", "unit": "chai 30ml", "tag": "Mới", "rating": 4.4, "reviews": 22, "plants": ["Cây ăn trái", "Hoa màu"], "desc": "Kích thích ra hoa đồng loạt, hoa to và nhiều hơn, tăng tỷ lệ đậu quả."},
    {"id": 7, "catId": 3, "name": "Anvil 5SC", "price": 95000, "listPrice": 115000, "promo": "Giảm 17%", "unit": "chai 100ml", "tag": "Bán chạy", "rating": 4.8, "reviews": 55, "plants": ["Lúa"], "desc": "Trừ nấm đạo ôn, khô vằn, lem lép hạt trên lúa. Hoạt chất: Hexaconazole 5% SC."},
    {"id": 8, "catId": 3, "name": "Carbenzim 500FL", "price": 75000, "listPrice": 75000, "promo": "", "unit": "chai 100ml", "tag": "", "rating": 4.5, "reviews": 29, "plants": ["Lúa", "Rau màu", "Cây ăn trái"], "desc": "Phổ rộng, trừ nhiều loại nấm bệnh, thấm lá nhanh. Hoạt chất: Carbendazim 500g/L."},
    {"id": 9, "catId": 3, "name": "Mancozeb 80WP", "price": 55000, "listPrice": 65000, "promo": "Giảm 15%", "unit": "gói 200g", "tag": "", "rating": 4.3, "reviews": 17, "plants": ["Cây ăn trái", "Rau màu"], "desc": "Thuốc trừ bệnh tiếp xúc, phổ rộng, bảo vệ bề mặt lá lâu dài khỏi nấm bệnh."},
    {"id": 10, "catId": 4, "name": "Deadline 5G", "price": 45000, "listPrice": 55000, "promo": "Giảm 18%", "unit": "gói 500g", "tag": "Bán chạy", "rating": 4.9, "reviews": 78, "plants": ["Lúa"], "desc": "Diệt ốc bươu vàng hiệu quả cao, an toàn cho tôm cá. Hoạt chất: Metaldehyde 5%."},
    {"id": 11, "catId": 4, "name": "Bolis 6GR", "price": 52000, "listPrice": 52000, "promo": "", "unit": "gói 500g", "tag": "", "rating": 4.6, "reviews": 33, "plants": ["Lúa", "Rau màu"], "desc": "Dạng hạt, rải trực tiếp ruộng nước, diệt ốc và sên nhớt nhanh trong 24h."},
    {"id": 12, "catId": 5, "name": "Regent 800WG", "price": 88000, "listPrice": 105000, "promo": "Giảm 16%", "unit": "gói 5g x10", "tag": "Bán chạy", "rating": 4.8, "reviews": 91, "plants": ["Lúa", "Rau màu"], "desc": "Trừ sâu đục thân, rầy nâu, bọ trĩ hiệu quả cao. Hoạt chất: Fipronil 800g/kg."},
    {"id": 13, "catId": 5, "name": "Actara 25WG", "price": 135000, "listPrice": 135000, "promo": "", "unit": "gói 3g", "tag": "", "rating": 4.7, "reviews": 44, "plants": ["Rau màu", "Cây ăn trái"], "desc": "Lưu dẫn mạnh, diệt sâu chích hút triệt để, tác dụng kéo dài 2-3 tuần."},
    {"id": 14, "catId": 5, "name": "Abamectin 3.6EC", "price": 72000, "listPrice": 90000, "promo": "Giảm 20%", "unit": "chai 100ml", "tag": "Mới", "rating": 4.5, "reviews": 26, "plants": ["Rau màu", "Cây ăn trái", "Hoa màu"], "desc": "Trừ nhện đỏ, bọ trĩ, sâu vẽ bùa hiệu quả, phổ tác dụng rộng."},
    {"id": 15, "catId": 6, "name": "Tervigo 020SC", "price": 185000, "listPrice": 220000, "promo": "Giảm 16%", "unit": "chai 50ml", "tag": "Mới", "rating": 4.7, "reviews": 28, "plants": ["Rau màu", "Cây ăn trái", "Tiêu", "Cà phê"], "desc": "Trừ tuyến trùng bộ rễ an toàn, ít ảnh hưởng đến vi sinh vật đất có lợi."},
    {"id": 16, "catId": 6, "name": "Nimitz 480SC", "price": 220000, "listPrice": 220000, "promo": "", "unit": "chai 100ml", "tag": "Bán chạy", "rating": 4.8, "reviews": 36, "plants": ["Rau màu", "Tiêu", "Điều"], "desc": "Fluensulfone - cơ chế mới, diệt tuyến trùng nhanh và bền vững hơn."},
]

NEWS = [
    {"catName": "Kỹ Thuật", "title": "Phòng trừ sâu keo mùa thu hại ngô hiệu quả", "date": "15/04/2026", "excerpt": "Sâu keo mùa thu đang gây hại nghiêm trọng trên nhiều vùng trồng ngô, cần áp dụng biện pháp phòng trừ kịp thời.", "tags": ["sâu-keo", "ngô", "phòng-trừ", "kỹ-thuật"]},
    {"catName": "Kinh Nghiệm", "title": "Bí quyết tăng năng suất lúa vụ Hè Thu 2026", "date": "10/04/2026", "excerpt": "Các biện pháp kỹ thuật giúp tăng năng suất lúa từ 15-20% trong vụ Hè Thu, bao gồm quản lý nước và dinh dưỡng hợp lý.", "tags": ["lúa", "năng-suất", "hè-thu", "kinh-nghiệm"]},
    {"catName": "Tin Tức", "title": "Ra mắt dòng sản phẩm kích thích sinh trưởng mới", "date": "05/04/2026", "excerpt": "Được Mùa GAH chính thức giới thiệu dòng sản phẩm kích thích sinh trưởng thế hệ mới, hiệu quả vượt trội trên cây ăn trái.", "tags": ["sản-phẩm-mới", "kích-thích-sinh-trưởng", "cây-ăn-trái"]},
    {"catName": "Kỹ Thuật", "title": "Quản lý ốc bươu vàng trên ruộng lúa sạ", "date": "01/04/2026", "excerpt": "Hướng dẫn phòng trừ ốc bươu vàng toàn diện từ khâu chuẩn bị đất đến khi lúa đẻ nhánh, tránh thiệt hại mất trắng.", "tags": ["ốc-bươu-vàng", "lúa", "phòng-trừ", "kỹ-thuật"]},
    {"catName": "Thị Trường", "title": "Giá lúa gạo dự báo tăng trong quý 2/2026", "date": "28/03/2026", "excerpt": "Dự báo thị trường xuất khẩu gạo Việt Nam quý 2 năm 2026 tiếp tục khởi sắc nhờ nhu cầu từ các thị trường châu Phi và Trung Đông.", "tags": ["thị-trường", "xuất-khẩu", "gạo", "2026"]},
    {"catName": "Kinh Nghiệm", "title": "Cách pha thuốc trừ sâu đúng kỹ thuật và an toàn", "date": "20/03/2026", "excerpt": "Nguyên tắc 4 đúng trong sử dụng thuốc bảo vệ thực vật giúp tăng hiệu quả phòng trừ và giảm thiểu ô nhiễm môi trường.", "tags": ["thuốc-trừ-sâu", "an-toàn", "kỹ-thuật", "4-đúng"]},
]

DOCS_PAPER = [
    {"title": "Hướng Dẫn Sử Dụng Anvil 5SC", "topic": "Thuốc BVTV", "plant": "Lúa", "date": "01/2026"},
    {"title": "Quy Trình Bón Phân Cho Cây Ăn Trái", "topic": "Kỹ Thuật", "plant": "Cây ăn trái", "date": "12/2025"},
    {"title": "Hướng Dẫn Vận Hành Máy Phun Điện 16L", "topic": "Máy & TB", "plant": "Tất cả", "date": "11/2025"},
    {"title": "Phòng Trừ Tuyến Trùng Trên Tiêu, Cà Phê", "topic": "Kỹ Thuật", "plant": "Tiêu, Cà phê", "date": "10/2025"},
    {"title": "Quản Lý Dịch Hại Tổng Hợp IPM Trên Lúa", "topic": "Kỹ Thuật", "plant": "Lúa", "date": "09/2025"},
]

DOCS_VIDEO = [
    {"title": "Demo Máy Phun Điện 16L Ngoài Đồng", "topic": "Máy & TB", "plant": "Lúa", "duration": "5:32"},
    {"title": "Cách Pha Và Phun Thuốc Trừ Sâu An Toàn", "topic": "Kỹ Thuật", "plant": "Tất cả", "duration": "8:15"},
    {"title": "Phòng Trừ Ốc Bươu Vàng Hiệu Quả Trên Ruộng Lúa", "topic": "Kỹ Thuật", "plant": "Lúa", "duration": "6:48"},
    {"title": "Hướng Dẫn Sử Dụng Thuốc Kích Thích Ra Hoa", "topic": "Kỹ Thuật", "plant": "Cây ăn trái", "duration": "4:20"},
    {"title": "Kỹ Thuật Phun Thuốc Đúng Cách - 4 Đúng", "topic": "Kỹ Thuật", "plant": "Tất cả", "duration": "7:05"},
]


def make_slug(value):
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return slugify(ascii_value) or slugify(value, allow_unicode=True)


def parse_news_date(value):
    date_value = datetime.strptime(value, "%d/%m/%Y")
    return timezone.make_aware(date_value)


class Command(BaseCommand):
    help = "Seed prototype data for Duoc Mua."

    def handle(self, *args, **options):
        User = get_user_model()
        with transaction.atomic():
            author, _ = User.objects.get_or_create(
                username="seed-author",
                defaults={
                    "email": "seed-author@duocmua.local",
                    "first_name": "Được Mùa",
                    "last_name": "Editorial",
                },
            )

            categories = self.seed_categories()
            plants = self.seed_plants()
            products_created = self.seed_products(categories, plants)
            articles_created = self.seed_news(author)
            paper_created, video_created = self.seed_documents(plants)

        self.stdout.write(
            self.style.SUCCESS(
                "Seed completed: "
                f"categories={Category.objects.count()}, "
                f"plants={Plant.objects.count()}, "
                f"products={Product.objects.count()} (touched={products_created}), "
                f"articles={Article.objects.count()} (touched={articles_created}), "
                f"documents_paper={Document.objects.filter(doc_type=Document.TYPE_PAPER).count()} (touched={paper_created}), "
                f"documents_video={Document.objects.filter(doc_type=Document.TYPE_VIDEO).count()} (touched={video_created})"
            )
        )

    def seed_categories(self):
        categories = {}
        for item in CATS:
            category, _ = Category.objects.update_or_create(
                slug=make_slug(item["name"]),
                defaults={
                    "name": item["name"],
                    "color": item["color"],
                    "icon": "",
                },
            )
            categories[item["id"]] = category
        return categories

    def seed_plants(self):
        plants = {}
        for name in PLANTS:
            plant, _ = Plant.objects.update_or_create(
                slug=make_slug(name),
                defaults={"name": name},
            )
            plants[name.lower()] = plant
        return plants

    def seed_products(self, categories, plants):
        touched = 0
        valid_tags = {choice[0] for choice in Product.TAG_CHOICES}
        for item in PRODUCTS:
            sale_price = item["price"] if item["price"] < item["listPrice"] else None
            product, _ = Product.objects.update_or_create(
                slug=make_slug(item["name"]),
                defaults={
                    "name": item["name"],
                    "category": categories[item["catId"]],
                    "tag": item["tag"] if item["tag"] in valid_tags else "",
                    "price": item["listPrice"],
                    "sale_price": sale_price,
                    "specs": {
                        "unit": item["unit"],
                        "promo": item["promo"],
                        "rating": item["rating"],
                        "reviews": item["reviews"],
                    },
                    "description": item["desc"],
                    "usage": "Tham khảo hướng dẫn trên bao bì sản phẩm và tư vấn kỹ thuật trước khi sử dụng.",
                    "guide": "Sử dụng đúng liều lượng, đúng thời điểm và bảo hộ đầy đủ khi thao tác.",
                    "sale_count": item["reviews"],
                    "is_active": True,
                    "sort_order": item["id"],
                },
            )
            product.plants.set([plants[name.lower()] for name in item["plants"]])
            touched += 1
        return touched

    def seed_news(self, author):
        touched = 0
        for item in NEWS:
            category, _ = NewsCategory.objects.update_or_create(
                slug=make_slug(item["catName"]),
                defaults={"name": item["catName"]},
            )
            article, _ = Article.objects.update_or_create(
                slug=make_slug(item["title"]),
                defaults={
                    "title": item["title"],
                    "category": category,
                    "summary": item["excerpt"],
                    "content": f"<p>{item['excerpt']}</p>",
                    "author": author,
                    "is_published": True,
                    "published_at": parse_news_date(item["date"]),
                },
            )
            hashtags = []
            for tag in item["tags"]:
                hashtag, _ = Hashtag.objects.update_or_create(
                    name=tag,
                    defaults={"name": tag},
                )
                hashtags.append(hashtag)
            article.hashtags.set(hashtags)
            touched += 1
        return touched

    def seed_documents(self, plants):
        paper_touched = 0
        video_touched = 0
        for item in DOCS_PAPER:
            document = self.upsert_document(
                item=item,
                doc_type=Document.TYPE_PAPER,
                summary=f"Tài liệu đọc cập nhật {item['date']}.",
                content=f"Nội dung hướng dẫn cho {item['title']}.",
                plants=plants,
            )
            self.assign_document_plants(document, item["plant"], plants)
            paper_touched += 1

        for index, item in enumerate(DOCS_VIDEO, start=1):
            document = self.upsert_document(
                item=item,
                doc_type=Document.TYPE_VIDEO,
                summary=f"Video hướng dẫn thời lượng {item['duration']}.",
                content=f"Video minh họa cho {item['title']}.",
                plants=plants,
                video_url=f"https://www.youtube.com/watch?v=duocmua-demo-{index}",
            )
            self.assign_document_plants(document, item["plant"], plants)
            video_touched += 1
        return paper_touched, video_touched

    def upsert_document(self, item, doc_type, summary, content, plants, video_url=None):
        category, _ = DocCategory.objects.update_or_create(
            slug=make_slug(item["topic"]),
            defaults={"name": item["topic"]},
        )
        document, _ = Document.objects.update_or_create(
            slug=make_slug(f"{doc_type}-{item['title']}"),
            defaults={
                "title": item["title"],
                "doc_type": doc_type,
                "category": category,
                "summary": summary,
                "content": content,
                "video_url": video_url,
                "is_published": True,
            },
        )
        return document

    def assign_document_plants(self, document, plant_value, plants):
        if plant_value == "Tất cả":
            document.plants.set(plants.values())
            return
        names = [name.strip().lower() for name in plant_value.split(",")]
        document.plants.set([plants[name] for name in names if name in plants])
