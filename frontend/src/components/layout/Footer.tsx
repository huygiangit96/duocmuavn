"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { IC, dmBtn } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Category, SiteConfig } from "@/types";

const fallbackCategories: Category[] = [
  { id: 1, name: "Thuốc Bảo Vệ Thực Vật", slug: "thuoc-bvtv", color: "#49a035", icon: "" },
  { id: 2, name: "Phân Bón", slug: "phan-bon", color: "#1E5BAA", icon: "" },
  { id: 3, name: "Hạt Giống", slug: "hat-giong", color: "#F07020", icon: "" },
  { id: 4, name: "Máy & Thiết Bị", slug: "may-thiet-bi", color: "#9EC231", icon: "" },
];

const fallbackConfig: SiteConfig = {
  hotline: "1800 xxxx",
  zalo_url: "#",
  facebook_url: "#",
  address: "123 Đường Nông Nghiệp, TP. Cần Thơ",
  email: "contact@duocmua.vn",
  google_map_embed: "",
  policy_buying: "",
  policy_shipping: "",
  tagline: "",
};

async function fetchCategories() {
  const response = await api.get<Category[]>("/categories/");
  return response.data;
}

async function fetchConfig() {
  const response = await api.get<Partial<SiteConfig>>("/config/");
  return { ...fallbackConfig, ...response.data };
}

export function Footer() {
  const t = useTranslations();
  const { data } = useQuery({
    queryKey: ["footer-categories"],
    queryFn: fetchCategories,
    retry: false,
  });
  const { data: config = fallbackConfig } = useQuery({
    queryKey: ["footer-config"],
    queryFn: fetchConfig,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const categories = data?.length ? data : fallbackCategories;

  return (
    <footer style={{ background: "#0d1f08", color: "#8ab068", padding: "52px 0 24px" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 36 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" style={{ width: 44, height: 44, objectFit: "contain" }} alt="" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.1 }}>Được Mùa GAH</div>
              <div style={{ fontSize: 11, color: "#9EC231", fontWeight: 600, letterSpacing: 1 }}>NÔNG NGHIỆP VIỆT</div>
            </div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: "#6a9050", margin: "0 0 18px" }}>{config.tagline || t("header.slogan")}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={`tel:${config.hotline}`} style={{ ...dmBtn("var(--green)"), fontSize: 13, padding: "8px 14px", textDecoration: "none" }}>
              <IC.Phone />{config.hotline || "Hotline"}
            </a>
          </div>
        </div>
        <div>
          <h4 style={{ color: "#fff", marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{t("footer.products")}</h4>
          {categories.map((c) => (
            <Link key={c.id} href={`/san-pham?category=${c.slug}`} style={{ display: "block", marginBottom: 9, fontSize: 13, cursor: "pointer", color: "#6a9050", transition: "color 0.2s", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "#9EC231"} onMouseLeave={(e) => e.currentTarget.style.color = "#6a9050"}>{c.name}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: "#fff", marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{t("footer.support")}</h4>
          {["Chính sách mua hàng", "Chính sách vận chuyển", "Chính sách đổi trả", "Hướng dẫn đặt hàng", "Hệ thống đại lý"].map((item) => (
            <Link key={item} href="/lien-he" style={{ display: "block", marginBottom: 9, fontSize: 13, cursor: "pointer", color: "#6a9050", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "#9EC231"} onMouseLeave={(e) => e.currentTarget.style.color = "#6a9050"}>{item}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: "#fff", marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{t("footer.contact")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#6a9050" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <IC.Pin />{config.address || fallbackConfig.address}
            </div>
            <a
              href={`tel:${config.hotline}`}
              style={{ display: "flex", gap: 9, color: "#6a9050", textDecoration: "none" }}
            >
              <IC.Phone />{config.hotline || fallbackConfig.hotline}
            </a>
            <a
              href={`mailto:${config.email}`}
              style={{ display: "flex", gap: 9, color: "#6a9050", textDecoration: "none" }}
            >
              <IC.Mail />{config.email || fallbackConfig.email}
            </a>
          </div>
          <div style={{ marginTop: 14, borderRadius: 10, overflow: "hidden", border: "1px solid #1c3510", position: "relative", height: 140 }}>
            {config.google_map_embed ? (
              <div
                style={{ width: "100%", height: "100%" }}
                dangerouslySetInnerHTML={{ __html: config.google_map_embed }}
              />
            ) : (
              <>
                <iframe
                  title="Bản đồ Được Mùa GAH"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=105.7602%2C10.0252%2C105.7902%2C10.0552&layer=mapnik&marker=10.0402%2C105.7752"
                  style={{ border: 0, width: "100%", height: "100%", filter: "grayscale(0.2) brightness(0.95)" }}
                  loading="lazy"
                />
                <a
                  href="https://www.openstreetmap.org/?mlat=10.0402&mlon=105.7752#map=14/10.0402/105.7752"
                  target="_blank"
                  rel="noopener"
                  style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(13,31,8,0.85)", color: "#9EC231", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: "none" }}
                >
                  OpenStreetMap
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1c3510", marginTop: 36, paddingTop: 18, textAlign: "center", fontSize: 12, color: "#3d5a28" }}>
        {t("footer.copyright")} · {t("header.slogan")}
        {" · "}
        <Link href="/quan-tri" style={{ cursor: "pointer", color: "#6a9050", textDecoration: "underline" }} onMouseEnter={(e) => e.currentTarget.style.color = "#9EC231"} onMouseLeave={(e) => e.currentTarget.style.color = "#6a9050"}>{t("footer.admin_link")}</Link>
      </div>
    </footer>
  );
}
