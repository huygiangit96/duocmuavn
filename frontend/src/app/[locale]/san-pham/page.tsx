"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { IC, dmBtn, dmIcon, dmInput } from "@/components/icons";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Category, PaginatedResponse, Plant, Product } from "@/types";

const PAGE_SIZE = 20;

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag: string;
  bg_color: string;
  order: number;
  is_active: boolean;
}

function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 22,
        borderRadius: 14,
        overflow: "hidden",
        height: 240,
      }}
    >
      {/* Render t?t c? slides, d?ng opacity ?? fade */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          onClick={() => { if (b.link) window.location.href = b.link; }}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            pointerEvents: i === current ? "auto" : "none",
            cursor: b.link ? "pointer" : "default",
          }}
        >
          {/* N?n m?u */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: b.bg_color || "linear-gradient(135deg, var(--green), var(--blue))",
            }}
          />
          {/* ?nh full n?n */}
          {b.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.image}
              alt={b.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%)",
            }}
          />
          {/* Tag badge */}
          {b.tag && (
            <span
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: "var(--orange)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {b.tag}
            </span>
          )}
          {/* Text */}
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 60 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#fff",
                marginBottom: 6,
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                lineHeight: 1.3,
              }}
            >
              {b.title}
            </div>
            {b.subtitle && (
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.88)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                {b.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Dots indicator ? n?m tr?n t?t c? slides */}
      {banners.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 16,
            display: "flex",
            gap: 6,
            zIndex: 10,
          }}
        >
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const emptyProducts: PaginatedResponse<Product> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

async function fetchCategories() {
  const response = await api.get<Category[]>("/categories/");
  return response.data;
}

async function fetchPlants() {
  const response = await api.get<Plant[]>("/plants/");
  return response.data;
}

async function fetchBanners() {
  const response = await api.get<Banner[] | PaginatedResponse<Banner>>(
    "/banners/?location=products"
  );
  const data = response.data;
  const results = Array.isArray(data) ? data : (data.results ?? []);
  return results.filter((b) => b.is_active);
}

async function fetchProducts(params: {
  category: string;
  plant: string;
  search: string;
  ordering: string;
  page: number;
}) {
  const query = new URLSearchParams();
  query.set("page_size", String(PAGE_SIZE));
  query.set("page", String(params.page));
  if (params.category) query.set("category", params.category);
  if (params.plant) query.set("plants", params.plant);
  if (params.search) query.set("search", params.search);
  if (params.ordering) query.set("ordering", params.ordering);

  const response = await api.get<PaginatedResponse<Product>>(`/products/?${query}`);
  return response.data;
}

function ProductsPageContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const plant = searchParams.get("plant") || "";
  const search = searchParams.get("search") || "";
  const ordering = searchParams.get("ordering") || "";
  const page = Number(searchParams.get("page") || "1") || 1;
  const [q, setQ] = useState(search);
  const [showMobFilter, setShowMobFilter] = useState(false);

  const params = useMemo(
    () => ({ category, plant, search, ordering, page }),
    [category, plant, search, ordering, page],
  );

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: fetchCategories,
    retry: false,
  });
  const { data: plants = [] } = useQuery({
    queryKey: ["product-plants"],
    queryFn: fetchPlants,
    retry: false,
  });
  const { data: products = emptyProducts, isFetching } = useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    retry: false,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["product-banners"],
    queryFn: fetchBanners,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const setParam = (key: string, value: string | number | null, resetPage = true) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "default") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    if (resetPage) next.delete("page");
    router.push(`/san-pham${next.toString() ? `?${next}` : ""}`);
  };

  const clearFilters = () => {
    setQ("");
    router.push("/san-pham");
  };

  const submitSearch = () => setParam("search", q.trim());
  const totalPages = Math.max(1, Math.ceil(products.count / PAGE_SIZE));

  return (
    <div style={{ padding: "0 0 56px", minHeight: "100vh" }}>
      <div className="container">
        <BannerSlider banners={banners} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, flex: 1, minWidth: 120 }}>{t("product.title")}</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
            placeholder={t("product.search_placeholder")}
            style={{ ...dmInput, width: 200 }}
          />
          <select value={ordering || "default"} onChange={(e) => setParam("ordering", e.target.value)} style={{ ...dmInput, width: "auto", cursor: "pointer" }}>
            <option value="default">{t("product.sort_default")}</option>
            <option value="-created_at">{t("product.sort_newest")}</option>
            <option value="-sale_count">{t("product.sort_bestseller")}</option>
            <option value="price">{t("product.sort_price_asc")}</option>
            <option value="-price">{t("product.sort_price_desc")}</option>
          </select>
          <button className="mob-filter-btn" onClick={() => setShowMobFilter((v) => !v)} style={{ ...dmBtn(showMobFilter ? "var(--blue)" : "var(--bg-subtle)", showMobFilter ? "#fff" : "var(--text)"), padding: "10px 14px", display: "none" }}><IC.Filter /></button>
        </div>

        {showMobFilter && (
          <div style={{ marginBottom: 16 }}>
            <FilterSidebar
              categories={categories}
              plants={plants}
              category={category}
              plant={plant}
              onClear={clearFilters}
              onParamChange={setParam}
            />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 22 }} className="prod-layout">
          <div className="prod-sidebar">
            <FilterSidebar
              categories={categories}
              plants={plants}
              category={category}
              plant={plant}
              onClear={clearFilters}
              onParamChange={setParam}
            />
          </div>
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {isFetching ? t("common.loading") : t("product.count", { count: products.count })}
            </div>
            {products.results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "#fff", borderRadius: 14 }}>
                <p style={{ marginBottom: 16 }}>{t("product.not_found")}</p>
                <button onClick={clearFilters} style={dmBtn("var(--green)")}>{t("product.clear_filter")}</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(188px,1fr))", gap: 16 }}>
                  {products.results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => setParam("page", nextPage, false)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  categories,
  plants,
  category,
  plant,
  onClear,
  onParamChange,
}: {
  categories: Category[];
  plants: Plant[];
  category: string;
  plant: string;
  onClear: () => void;
  onParamChange: (key: string, value: string | number | null, resetPage?: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--border)", position: "sticky", top: 100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{t("product.filter")}</h3>
        {(category || plant) && <button onClick={onClear} style={{ ...dmIcon, fontSize: 12, color: "var(--orange)", padding: "2px 6px", fontFamily: "var(--font)", fontWeight: 600, background: "#fff3ed", borderRadius: 6 }}>{t("product.clear_filter")}</button>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 22 }}>
        {[{ id: 0, name: t("product.all"), slug: "", color: "var(--text)", icon: "" }, ...categories].map((c) => {
          const selected = category === c.slug || (!c.slug && !category);
          return (
            <div key={c.slug || "all"} onClick={() => onParamChange("category", c.slug)} style={{ padding: "9px 12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: selected ? 700 : 400, background: selected ? (c.color || "var(--blue)") : "transparent", color: selected ? "#fff" : "var(--text)", transition: "all 0.2s" }}>
              {c.name}
            </div>
          );
        })}
      </div>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>{t("product.plants")}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {plants.map((p) => {
          const selected = plant === p.slug;
          return (
            <div key={p.slug} onClick={() => onParamChange("plant", selected ? "" : p.slug)} style={{ padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, border: "1.5px solid", borderColor: selected ? "var(--green)" : "var(--border)", background: selected ? "var(--green)" : "#fff", color: selected ? "#fff" : "var(--text)", transition: "all 0.2s" }}>{p.name}</div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations();

  return (
    <Suspense fallback={<div style={{ padding: "96px 0 56px" }}><div className="container">{t("common.loading")}</div></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
