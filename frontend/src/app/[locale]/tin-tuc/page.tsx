"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { BannerSlider } from "@/components/BannerSlider";
import { IC, dmIcon, dmInput, dmOutline } from "@/components/icons";
import { Pagination } from "@/components/Pagination";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Article, NewsCategory, PaginatedResponse } from "@/types";

const PAGE_SIZE = 20;

interface SliderBanner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag: string;
  bg_color: string;
  is_active: boolean;
}

const emptyArticles: PaginatedResponse<Article> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

async function fetchArticles(params: {
  category: string;
  search: string;
  page: number;
}) {
  const query = new URLSearchParams();
  query.set("page_size", String(PAGE_SIZE));
  query.set("page", String(params.page));
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  const response = await api.get<PaginatedResponse<Article>>(`/news/?${query}`);
  return response.data;
}

async function fetchNewsCategories() {
  const response = await api.get<NewsCategory[]>("/news-categories/");
  return response.data;
}

async function fetchNewsBanners() {
  const response = await api.get<{ results?: SliderBanner[] } | SliderBanner[]>(
    "/banners/?location=news"
  );
  const data = response.data;
  const results = Array.isArray(data) ? data : (data.results ?? []);
  return results.filter((b: { is_active: boolean }) => b.is_active);
}

function NewsImg({ article, height = 160 }: { article: Article; height?: number }) {
  if (article.thumbnail) {
    return (
      <div style={{ height, overflow: "hidden", background: "#e8f0fb" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.thumbnail} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ height, background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="28" height="20" rx="3" fill="#1E5BAA" opacity="0.15" /><rect x="8" y="10" width="20" height="3" rx="1.5" fill="#1E5BAA" opacity="0.3" /><rect x="8" y="16" width="14" height="2" rx="1" fill="#9EC231" opacity="0.5" /><rect x="8" y="21" width="17" height="2" rx="1" fill="#9EC231" opacity="0.4" /></svg>
      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{article.category.name}</span>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function NewsPageContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || "1") || 1;
  const [q, setQ] = useState(search);
  const params = useMemo(() => ({ category, search, page }), [category, search, page]);

  const { data: categories = [] } = useQuery({
    queryKey: ["news-categories"],
    queryFn: fetchNewsCategories,
    retry: false,
  });
  const { data: articles = emptyArticles, isFetching } = useQuery({
    queryKey: ["news", params],
    queryFn: () => fetchArticles(params),
    retry: false,
  });
  const { data: newsBanners = [] } = useQuery({
    queryKey: ["news-banners"],
    queryFn: fetchNewsBanners,
    retry: false,
  });

  const setParam = (key: string, value: string | number | null, resetPage = true) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
    if (resetPage) next.delete("page");
    router.push(`/tin-tuc${next.toString() ? `?${next}` : ""}`);
  };

  const submitSearch = () => setParam("search", q.trim());
  const totalPages = Math.max(1, Math.ceil(articles.count / PAGE_SIZE));
  const featured = articles.results.slice(0, 2);

  return (
    <div style={{ padding: "0 0 56px" }}>
      <div className="container">
        <BannerSlider banners={newsBanners} />
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 5px" }}>{t("news.title")}</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>{t("home.banner_sub")}</p>
        </div>

        {featured.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 36 }} className="news-2up">
            {featured.map((article) => (
              <Link key={article.id} href={`/tin-tuc/${article.slug}`} style={{ background: "linear-gradient(135deg, var(--blue) 0%, #0d3878 100%)", borderRadius: 16, padding: 30, color: "#fff", cursor: "pointer", position: "relative", overflow: "hidden", textDecoration: "none" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                <span style={{ background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5, display: "inline-block", marginBottom: 12 }}>{article.category.name}</span>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>{article.title}</h3>
                <p style={{ margin: "0 0 14px", opacity: 0.78, fontSize: 13, lineHeight: 1.65 }}>{article.summary}</p>
                <div style={{ fontSize: 12, opacity: 0.55 }}>{formatDate(article.published_at)}</div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>{t("news.categories")}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
            placeholder={t("news.search_placeholder")}
            style={{ ...dmInput, width: 220 }}
          />
          {[{ id: 0, name: t("product.all"), slug: "" }, ...categories].map((cat) => {
            const selected = category === cat.slug || (!cat.slug && !category);
            return (
              <div key={cat.slug || "all"} onClick={() => setParam("category", cat.slug)} style={{ padding: "7px 15px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "1.5px solid", borderColor: selected ? "var(--blue)" : "var(--border)", background: selected ? "#e8f0fb" : "#fff", color: selected ? "var(--blue)" : "var(--text)", transition: "all 0.2s" }}>{cat.name}</div>
            );
          })}
        </div>

        {isFetching && <div style={{ marginBottom: 12, color: "var(--text-muted)", fontSize: 13 }}>{t("common.loading")}</div>}
        {articles.results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "#fff", borderRadius: 14 }}>
            {t("common.no_data")}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px,1fr))", gap: 18 }}>
              {articles.results.map((article) => (
                <Link key={article.id} href={`/tin-tuc/${article.slug}`} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow)", border: "1px solid var(--border)", transition: "transform 0.25s", textDecoration: "none", color: "inherit", display: "block" }}>
                  <NewsImg article={article} />
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{article.category.name}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(article.published_at)}</span>
                    </div>
                    <h3 style={{ margin: "0 0 7px", fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}>{article.title}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.summary}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ ...dmOutline(), padding: "6px 12px", fontSize: 12 }}>{t("common.view_all")}</span>
                      <span style={{ ...dmIcon, padding: 6, color: "var(--text-muted)" }}><IC.Share /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => setParam("page", nextPage, false)} />
          </>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  const t = useTranslations();

  return (
    <Suspense fallback={<div style={{ padding: "0 0 56px" }}><div className="container">{t("common.loading")}</div></div>}>
      <NewsPageContent />
    </Suspense>
  );
}
