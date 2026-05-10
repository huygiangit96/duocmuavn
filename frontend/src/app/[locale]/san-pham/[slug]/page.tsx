"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { IC, dmBtn, dmQty } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { Stars } from "@/components/Stars";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { useCartStore, useToastStore, useUserStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import type { PaginatedResponse, Product } from "@/types";

interface ReviewItem {
  id: number;
  user_name: string;
  rating: number;
  text: string;
  created_at: string;
}

type TabKey = "desc" | "specs" | "reviews";

async function fetchProduct(slug: string) {
  const response = await api.get<Product>(`/products/${slug}/`);
  return response.data;
}

async function fetchRelated(categorySlug: string) {
  const response = await api.get<PaginatedResponse<Product>>(
    `/products/?category=${categorySlug}&page_size=4`,
  );
  return response.data.results;
}

function productPrice(product: Product) {
  return Number(product.sale_price ?? product.price ?? 0);
}

function listPrice(product: Product) {
  return Number(product.price ?? 0);
}

function productRating(product: Product) {
  return "rating" in product && typeof product.rating === "number" ? product.rating : 5;
}

function productReviews(product: Product) {
  if (typeof product.reviews_count === "number") return product.reviews_count;
  return typeof (product as { reviews?: number }).reviews === "number"
    ? (product as { reviews?: number }).reviews!
    : product.sale_count ?? 0;
}

function productUnit(product: Product) {
  const specs = product.specs;
  if (specs && typeof specs === "object") {
    const unit = specs.unit || specs.quy_cach || specs["Quy cách"];
    if (typeof unit === "string" || typeof unit === "number") {
      return String(unit);
    }
  }
  return "";
}

function productImages(product: Product) {
  const urls = [
    product.thumbnail,
    ...(product.images?.map((image) => image.image) ?? []),
  ].filter((url): url is string => Boolean(url));
  return Array.from(new Set(urls));
}

function ProductImg({
  product,
  src,
  height = 180,
}: {
  product: Product;
  src?: string;
  height?: number;
}) {
  const cat = product.category || { color: "#888", name: "" };
  const color = cat.color || "#888";

  if (src) {
    return (
      <div style={{ height, background: "#f0f0f0", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div style={{ height, background: "#f0f7e0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden" }}>
      <svg width="72" height="90" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="2" width="32" height="44" rx="4" fill={color} opacity="0.18" />
        <rect x="12" y="6" width="24" height="32" rx="3" fill={color} opacity="0.3" />
        <rect x="16" y="12" width="16" height="4" rx="2" fill={color} opacity="0.6" />
        <rect x="16" y="20" width="12" height="3" rx="1.5" fill={color} opacity="0.4" />
        <rect x="16" y="26" width="14" height="3" rx="1.5" fill={color} opacity="0.4" />
        <rect x="18" y="50" width="12" height="8" rx="2" fill={color} opacity="0.25" />
      </svg>
      <span style={{ fontSize: 12, color, opacity: 0.65, textAlign: "center", padding: "0 12px", fontFamily: "monospace", lineHeight: 1.4, maxWidth: "90%" }}>{product.name}</span>
    </div>
  );
}

function SpecsPanel({ product }: { product: Product }) {
  const t = useTranslations();
  const rows = Object.entries(product.specs || {});

  if (!rows.length) {
    return <p>{t("common.no_data")}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map(([key, value]) => (
        <div key={key} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <strong style={{ color: "var(--text-muted)" }}>{key}</strong>
          <span>{String(value ?? "")}</span>
        </div>
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{
            fontSize: 28,
            color: (hover || value) >= s ? "#f59e0b" : "#d1d5db",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewsPanel({ product, slug }: { product: Product; slug: string }) {
  const [page, setPage] = useState(1);
  const user = useUserStore((state) => state.user);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myText, setMyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["reviews", slug, page],
    queryFn: async () => {
      const r = await api.get<{ results: ReviewItem[]; count: number }>(
        `/products/${slug}/reviews/?page=${page}&page_size=5`,
      );
      return r.data;
    },
  });

  const reviews = data?.results ?? [];
  const total = data?.count ?? (product.reviews_count ?? 0);
  const rating = product.rating ?? 5;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
        )
      : star === 5 ? 100 : 0,
  }));

  const submitReview = async () => {
    if (!myText.trim()) {
      setSendErr("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSending(true);
    setSendErr("");
    try {
      await api.post(`/products/${slug}/reviews/`, {
        rating: myRating,
        text: myText,
      });
      setSubmitted(true);
      setShowForm(false);
      refetch();
    } catch (e: unknown) {
      const detail = (
        e as { response?: { data?: { detail?: string } } }
      )?.response?.data?.detail;
      setSendErr(detail || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, padding: "14px 0 22px", borderBottom: "1px solid var(--border)", marginBottom: 18, alignItems: "center" }}>
        <div style={{ textAlign: "center", paddingRight: 24, borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "var(--blue)", lineHeight: 1 }}>{rating.toFixed(1)}</div>
          <Stars rating={rating} />
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{total} đánh giá</div>
        </div>
        <div>
          {breakdown.map(({ star, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, fontSize: 12 }}>
              <span style={{ width: 42, color: "var(--text-muted)" }}>{star}★</span>
              <div style={{ flex: 1, height: 7, background: "var(--bg-subtle)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", borderRadius: 4 }} />
              </div>
              <span style={{ width: 36, color: "var(--text-muted)", textAlign: "right" }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </p>
      )}
      {reviews.map((r) => (
        <div key={r.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--green))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
              {r.user_name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 14 }}>{r.user_name}</strong>
                <span style={{ background: "#e8f4e0", color: "var(--green-dark)", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>
                  ✓ Đã mua
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {new Date(r.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
            <Stars rating={r.rating} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "var(--text)" }}>{r.text}</p>
        </div>
      ))}

      {total > page * 5 && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{ border: "1.5px solid var(--border)", background: "#fff", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font)" }}
          >
            Xem thêm đánh giá
          </button>
        </div>
      )}

      {!submitted && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => {
              if (!user) {
                setSendErr("Vui lòng đăng nhập để viết đánh giá.");
                return;
              }
              setShowForm((v) => !v);
            }}
            style={{ background: "var(--green)", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font)" }}
          >
            ✏ Viết đánh giá
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#e8f4e0", borderRadius: 10, color: "var(--green-dark)", fontSize: 14, fontWeight: 600 }}>
          ✓ Cảm ơn bạn! Đánh giá đang chờ duyệt và sẽ hiển thị sau khi được phê duyệt.
        </div>
      )}

      {showForm && (
        <div style={{ marginTop: 20, background: "var(--bg-subtle)", borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15 }}>Đánh giá của bạn</h4>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>
              Số sao *
            </label>
            <StarPicker value={myRating} onChange={setMyRating} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>
              Nội dung *
            </label>
            <textarea
              value={myText}
              onChange={(e) => setMyText(e.target.value)}
              placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
              rows={4}
              style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "var(--font)", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {sendErr && (
            <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
              {sendErr}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={submitReview}
              disabled={sending}
              style={{ background: "var(--blue)", border: "none", borderRadius: 8, padding: "10px 22px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font)", opacity: sending ? 0.7 : 1 }}
            >
              {sending ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button
              onClick={() => { setShowForm(false); setSendErr(""); }}
              style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 8, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "var(--font)" }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>("desc");
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);

  const {
    data: product,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => fetchProduct(slug),
    retry: false,
  });

  const status = isError && typeof error === "object" && error && "response" in error
    ? (error.response as { status?: number } | undefined)?.status
    : undefined;

  useEffect(() => {
    if (status === 404) {
      router.replace("/san-pham");
    }
  }, [router, status]);

  const relatedCategory = product?.category?.slug || "";
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", relatedCategory],
    queryFn: () => fetchRelated(relatedCategory),
    enabled: Boolean(relatedCategory),
    retry: false,
  });

  const images = useMemo(() => product ? productImages(product) : [], [product]);
  const activeSrc = images[activeImage];

  if (isLoading) {
    return (
      <div style={{ padding: "0 0 56px", minHeight: "60vh" }}>
        <div className="container">
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "var(--shadow)", color: "var(--text-muted)" }}>{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "0 0 56px", minHeight: "60vh" }}>
        <div className="container">
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "var(--shadow)", color: "var(--text-muted)" }}>{t("product.not_found")}</div>
        </div>
      </div>
    );
  }

  const price = productPrice(product);
  const originalPrice = listPrice(product);
  const related = relatedProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  const addToCart = () => {
    addItem({ product, quantity: qty });
    showToast(t("cart.added"));
  };

  const buyNow = () => {
    addItem({ product, quantity: qty });
    showToast(t("cart.added"));
    router.push("/thanh-toan");
  };

  const unit = productUnit(product);

  return (
    <div style={{ padding: "0 0 56px" }}>
      <div className="container">
        <div style={{ display: "flex", gap: 7, fontSize: 13, color: "var(--text-muted)", marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ cursor: "pointer", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>{t("nav.home")}</Link>
          <IC.ChevR />
          <Link href="/san-pham" style={{ cursor: "pointer", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>{t("product.title")}</Link>
          <IC.ChevR />
          <span>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }} className="detail-grid">
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <ProductImg product={product} src={activeSrc} height={320} />
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#fafbf8" }}>
              {(images.length ? images : [""]).slice(0, 4).map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} style={{ width: 60, height: 60, borderRadius: 8, border: `2px solid ${index === activeImage ? "var(--blue)" : "var(--border)"}`, overflow: "hidden", cursor: "pointer", opacity: index === activeImage ? 1 : 0.5, padding: 0, background: "#fff" }}>
                  <ProductImg product={product} src={image || undefined} height={60} />
                </button>
              ))}
            </div>
          </div>

          <div>
            {product.tag && <span style={{ background: product.tag === "Mới" ? "var(--green)" : "var(--orange)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 5, display: "inline-block", marginBottom: 10 }}>{product.tag}</span>}
            <div style={{ fontSize: 12, fontWeight: 700, color: product.category?.color || "var(--green)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{product.category?.name}</div>
            <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Stars rating={productRating(product)} />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{productRating(product)} ({productReviews(product)} {t("product.reviews").toLowerCase()})</span>
            </div>

            <div style={{ fontSize: 34, fontWeight: 900, color: "var(--blue)", letterSpacing: -1, marginBottom: 3, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              {fmt(price)}
              {product.sale_price && originalPrice > price && (
                <span style={{ fontSize: 18, color: "#999", textDecoration: "line-through", fontWeight: 600 }}>{fmt(originalPrice)}</span>
              )}
            </div>
            {unit && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{t("product.unit")}: {unit}</div>}

            {product.plants && product.plants.length > 0 && (
              <div style={{ marginBottom: 18, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{t("product.plants")}:</span>
                {product.plants.map((plant) => <span key={plant.slug} style={{ background: "#f0f7e0", color: "var(--green-dark)", fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5 }}>{plant.name}</span>)}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{t("product.quantity")}</span>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} style={{ ...dmQty, border: "none", width: 38, height: 38, borderRadius: 0 }}><IC.Minus /></button>
                <span style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} style={{ ...dmQty, border: "none", width: 38, height: 38, borderRadius: 0 }}><IC.Plus /></button>
              </div>
              <span style={{ fontSize: 13, color: "#27ae60", fontWeight: 600 }}>{t("product.in_stock")}</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <button type="button" onClick={addToCart} style={{ ...dmBtn("var(--green)"), fontSize: 15, padding: "13px 26px", borderRadius: 11 }}><IC.Plus />{t("product.add_to_cart")}</button>
              <button type="button" onClick={buyNow} style={{ ...dmBtn("var(--blue)"), fontSize: 15, padding: "13px 26px", borderRadius: 11 }}>{t("product.buy_now")}</button>
            </div>

            <div style={{ background: "var(--bg-subtle)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)" }}>
              <IC.Phone />
              <span>{t("header.hotline")}: <strong style={{ color: "var(--blue)" }}>1800 xxxx</strong></span>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid var(--border)", marginBottom: 40, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
            {[
              ["desc", t("product.description")],
              ["specs", t("product.specs")],
              ["reviews", `${t("product.reviews")} (${productReviews(product)})`],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as TabKey)} style={{ padding: "14px 22px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === key ? 800 : 500, fontSize: 14, color: tab === key ? "var(--blue)" : "var(--text-muted)", borderBottom: tab === key ? "3px solid var(--blue)" : "3px solid transparent", transition: "all 0.2s", fontFamily: "var(--font)", whiteSpace: "nowrap" }}>{label}</button>
            ))}
          </div>
          <div style={{ padding: "22px 24px", lineHeight: 1.85, color: "var(--text)", fontSize: 14 }}>
            {tab === "desc" && (
              <div>
                <p>{product.description || t("common.no_data")}</p>
                {product.usage && <p style={{ marginTop: 14 }}><strong>{t("product.description")}:</strong> {product.usage}</p>}
                {product.guide && <p style={{ marginTop: 14 }}><strong>{t("product.specs")}:</strong> {product.guide}</p>}
              </div>
            )}
            {tab === "specs" && <SpecsPanel product={product} />}
            {tab === "reviews" && <ReviewsPanel product={product} slug={slug} />}
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800 }}>{t("product.related")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(188px,1fr))", gap: 16 }}>
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
