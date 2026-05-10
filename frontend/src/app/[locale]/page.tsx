"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { IC, dmBtn } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Article, Banner, Category, PaginatedResponse, Product, SiteConfig } from "@/types";

const fallbackBanner: Banner = {
  id: 0,
  title: "Cơ Giới Hoá Nông Nghiệp Thông Minh",
  subtitle: "Máy phun điện, máy sạ lúa, thiết bị tiên tiến cho nhà nông hiện đại",
  image: "/logo.png",
  link: "/san-pham",
  order: 0,
  is_active: true,
  tag: "Máy & Thiết Bị",
  bg_color: "linear-gradient(135deg, #1E5BAA 0%, #0d3878 100%)",
};

const fallbackCategories: Category[] = [
  { id: 1, name: "Thuốc BVTV", slug: "thuoc-bvtv", color: "#49a035", icon: "" },
  { id: 2, name: "Phân bón", slug: "phan-bon", color: "#1E5BAA", icon: "" },
  { id: 3, name: "Hạt giống", slug: "hat-giong", color: "#F07020", icon: "" },
  { id: 4, name: "Máy móc", slug: "may-moc", color: "#9EC231", icon: "" },
];

const fallbackProducts: Product[] = [
  { id: 9001, name: "Bộ giải pháp chăm sóc cây trồng Được Mùa", slug: "bo-giai-phap-cham-soc-cay-trong", category: fallbackCategories[0], tag: "Bán chạy", price: "320000", sale_price: "285000", thumbnail: null },
  { id: 9002, name: "Dinh dưỡng sinh học phục hồi rễ", slug: "dinh-duong-sinh-hoc-phuc-hoi-re", category: fallbackCategories[1], tag: "Mới", price: "180000", sale_price: null, thumbnail: null },
  { id: 9003, name: "Chế phẩm phòng trừ sâu bệnh tổng hợp", slug: "che-pham-phong-tru-sau-benh", category: fallbackCategories[0], tag: "Khuyến mãi", price: "245000", sale_price: "219000", thumbnail: null },
  { id: 9004, name: "Máy phun điện nông nghiệp tiện dụng", slug: "may-phun-dien-nong-nghiep", category: fallbackCategories[3], tag: "", price: "1250000", sale_price: null, thumbnail: null },
];

const fallbackConfig: SiteConfig = {
  hotline: "1800 xxxx",
  zalo_url: "#",
  facebook_url: "#",
  address: "",
  email: "contact@duocmua.vn",
  google_map_embed: "",
  policy_buying: "",
  policy_shipping: "",
  tagline: "",
};

const getResults = <T,>(data: T[] | PaginatedResponse<T>) => Array.isArray(data) ? data : data.results;

async function fetchBanners() {
  const response = await api.get<Banner[] | PaginatedResponse<Banner>>(
    "/banners/?location=home"
  );
  return getResults(response.data).filter((banner) => banner.is_active);
}

async function fetchProducts() {
  const response = await api.get<PaginatedResponse<Product>>("/products/?ordering=-sale_count&page_size=8");
  return response.data.results;
}

async function fetchCategories() {
  const response = await api.get<Category[]>("/categories/");
  return response.data;
}

async function fetchArticles() {
  const response = await api.get<PaginatedResponse<Article>>("/news/?page_size=3");
  return response.data.results;
}

async function fetchConfig() {
  const response = await api.get<SiteConfig>("/config/");
  return response.data;
}

function SectionTitle({ title, sub, noMargin }: { title: string; sub?: string; noMargin?: boolean }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 28 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "clamp(18px,2.8vw,28px)", fontWeight: 800, color: "var(--text)" }}>{title}</h2>
      {sub && <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 15, fontWeight: 400 }}>{sub}</p>}
    </div>
  );
}

function NewsImg({ catName, image, height = 160 }: { catName: string; image?: string | null; height?: number }) {
  if (image) {
    return (
      <div style={{ height, background: "#f4f7f0", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={catName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ height, background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="28" height="20" rx="3" fill="#1E5BAA" opacity="0.15" /><rect x="8" y="10" width="20" height="3" rx="1.5" fill="#1E5BAA" opacity="0.3" /><rect x="8" y="16" width="14" height="2" rx="1" fill="#9EC231" opacity="0.5" /><rect x="8" y="21" width="17" height="2" rx="1" fill="#9EC231" opacity="0.4" /></svg>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{catName}</span>
    </div>
  );
}

export default function Home() {
  const t = useTranslations();
  const { data: banners } = useQuery({ queryKey: ["home-banners"], queryFn: fetchBanners, retry: false });
  const { data: products = fallbackProducts } = useQuery({ queryKey: ["home-products"], queryFn: fetchProducts, retry: false });
  const { data: categories = fallbackCategories } = useQuery({ queryKey: ["home-categories"], queryFn: fetchCategories, retry: false });
  const { data: articles = [] } = useQuery({ queryKey: ["home-articles"], queryFn: fetchArticles, retry: false });
  const { data: config = fallbackConfig } = useQuery({ queryKey: ["home-config"], queryFn: fetchConfig, retry: false });
  const heroBanners = banners && banners.length > 0
    ? banners
    : [{ ...fallbackBanner, title: t("home.banner_title"), subtitle: t("home.banner_sub") }];

  const [heroCurrent, setHeroCurrent] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroCurrent((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const hero = heroBanners[heroCurrent];

  return (
    <div>
      <section style={{ background: hero.bg_color || fallbackBanner.bg_color, minHeight: 480, display: "flex", alignItems: "center", padding: "64px 0", transition: "background 1.2s ease", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -80, top: -80, width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 60, top: 60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        {heroBanners.map((b, i) => (
          b.image && b.image !== "/logo.png" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={b.id}
              src={b.image}
              alt={b.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: i === heroCurrent ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
          ) : null
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          }}
        />
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.14)", color: "#fff", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 20, backdropFilter: "blur(6px)", letterSpacing: 0.5 }}>{hero.tag}</div>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,4vw,46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15 }}>{hero.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, margin: "0 0 36px", lineHeight: 1.7, maxWidth: 480 }}>{hero.subtitle}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href={hero.link || "/san-pham"} style={{ ...dmBtn("#FFE600", "#1a1a1a"), fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none" }}>{t("cart.shop_now")}</Link>
              <Link href="/lien-he" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", backdropFilter: "blur(4px)", textDecoration: "none" }}>{t("home.cta_contact")}</Link>
            </div>
          </div>
          <div className="hide-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "3px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image || "/logo.png"} style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }} alt="" />
            </div>
          </div>
        </div>
        {heroBanners.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
              zIndex: 2,
            }}
          >
            {heroBanners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroCurrent(i)}
                style={{
                  width: i === heroCurrent ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === heroCurrent ? "#fff" : "rgba(255,255,255,0.4)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section style={{ padding: "60px 0", background: "var(--bg-subtle)" }}>
        <div className="container">
          <SectionTitle title={t("home.categories")} sub={t("home.banner_sub")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/san-pham?category=${cat.slug}`} style={{ background: "#fff", borderRadius: 14, padding: "22px 14px", textAlign: "center", cursor: "pointer", border: "2px solid transparent", transition: "all 0.25s", boxShadow: "var(--shadow)", textDecoration: "none" }}>
                <div style={{ width: 52, height: 52, background: "#f0f7e0", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill={cat.color} opacity="0.25"/><circle cx="12" cy="12" r="5" fill={cat.color} opacity="0.5"/><circle cx="12" cy="12" r="2.5" fill={cat.color}/></svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <SectionTitle title={t("home.featured")} sub={t("home.banner_sub")} noMargin />
            <Link href="/san-pham" style={{ color: "var(--blue)", border: "2px solid var(--blue)", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>{t("common.view_all")} <IC.ChevR /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 18 }}>
            {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--blue)", padding: "48px 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 24, textAlign: "center" }}>
          {[["15+","Năm kinh nghiệm"],["200+","Sản phẩm"],["5.000+","Khách hàng tin dùng"],["50+","Đại lý toàn quốc"]].map(([n,l]) => (
            <div key={l}><div style={{ fontSize: 40, fontWeight: 900, color: "#FFE600", lineHeight: 1 }}>{n}</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{l}</div></div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 0", background: "var(--bg-subtle)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <SectionTitle title={t("home.latest_news")} sub={t("home.banner_sub")} noMargin />
            <Link href="/tin-tuc" style={{ color: "var(--blue)", border: "2px solid var(--blue)", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>{t("common.view_all")} <IC.ChevR /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 18 }}>
            {articles.slice(0, 3).map((n) => (
              <Link key={n.id} href={`/tin-tuc/${n.slug}`} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "transform 0.25s", textDecoration: "none", display: "block" }}>
                <NewsImg catName={n.category.name} image={n.thumbnail} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <span style={{ background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{n.category.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{n.published_at ? new Date(n.published_at).toLocaleDateString("vi-VN") : "Mới nhất"}</span>
                  </div>
                  <h3 style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: "var(--text)" }}>{n.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{n.summary}</p>
                </div>
              </Link>
            ))}
            {articles.length === 0 && (
              <div style={{ gridColumn: "1 / -1", background: "#fff", border: "1px dashed var(--border)", borderRadius: 14, padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                Chưa có bài viết nào được xuất bản.
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0", background: "linear-gradient(135deg, #1a3f06 0%, #0d2203 100%)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(20px,3vw,34px)", fontWeight: 800, margin: "0 0 10px" }}>{t("home.cta_contact")}</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, margin: "0 0 32px" }}>{t("home.banner_sub")}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`tel:${config.hotline}`} style={{ ...dmBtn("#9EC231", "#1a1a1a"), fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none" }}><IC.Phone />{t("header.hotline")}</a>
            <Link href="/lien-he" style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.45)", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>{t("home.cta_contact")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
