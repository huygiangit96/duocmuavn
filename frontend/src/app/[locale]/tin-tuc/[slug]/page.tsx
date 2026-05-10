"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { IC, dmIcon, dmOutline } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Article, PaginatedResponse } from "@/types";

async function fetchArticle(slug: string) {
  const response = await api.get<Article>(`/news/${slug}/`);
  return response.data;
}

async function fetchLatestArticles() {
  const response = await api.get<PaginatedResponse<Article>>("/news/?page_size=5");
  return response.data.results;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function ArticleHeroImage({ article }: { article: Article }) {
  if (article.thumbnail) {
    return (
      <div style={{ height: 320, overflow: "hidden", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.thumbnail} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ height: 320, background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <svg width="58" height="58" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="28" height="20" rx="3" fill="#1E5BAA" opacity="0.15" /><rect x="8" y="10" width="20" height="3" rx="1.5" fill="#1E5BAA" opacity="0.3" /><rect x="8" y="16" width="14" height="2" rx="1" fill="#9EC231" opacity="0.5" /><rect x="8" y="21" width="17" height="2" rx="1" fill="#9EC231" opacity="0.4" /></svg>
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#aaa" }}>{article.category.name}</span>
    </div>
  );
}

export default function ArticleDetailPage() {
  const t = useTranslations();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: article, error, isError, isLoading } = useQuery({
    queryKey: ["article-detail", slug],
    queryFn: () => fetchArticle(slug),
    retry: false,
  });
  const { data: latest = [] } = useQuery({
    queryKey: ["latest-news"],
    queryFn: fetchLatestArticles,
    retry: false,
  });

  const status = isError && typeof error === "object" && error && "response" in error
    ? (error.response as { status?: number } | undefined)?.status
    : undefined;

  useEffect(() => {
    if (status === 404) router.replace("/tin-tuc");
  }, [router, status]);

  if (isLoading) {
    return (
      <div style={{ padding: "0 0 56px" }}>
        <div className="container">
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "var(--shadow)", color: "var(--text-muted)" }}>{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: "0 0 56px" }}>
        <div className="container">
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "var(--shadow)", color: "var(--text-muted)" }}>{t("common.error")}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 56px" }}>
      <div className="container">
        <div style={{ display: "flex", gap: 7, fontSize: 13, color: "var(--text-muted)", marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ cursor: "pointer", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>{t("nav.home")}</Link>
          <IC.ChevR />
          <Link href="/tin-tuc" style={{ cursor: "pointer", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>{t("news.title")}</Link>
          <IC.ChevR />
          <span>{article.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }} className="news-2up">
          <article>
            <ArticleHeroImage article={article} />
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5 }}>{article.category.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("news.published_at")}: {formatDate(article.published_at || article.created_at)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}><IC.Eye />{article.view_count} {t("news.views")}</span>
              </div>
              <h1 style={{ margin: "0 0 12px", fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, lineHeight: 1.25 }}>{article.title}</h1>
              <p style={{ margin: "0 0 22px", color: "var(--text-muted)", fontSize: 16, lineHeight: 1.75 }}>{article.summary}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                {article.hashtags.map((tag) => (
                  <span key={tag.id} style={{ background: "#e8f0fb", color: "var(--blue)", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{tag.name}</span>
                ))}
              </div>
              <div
                style={{ lineHeight: 1.9, fontSize: 15, color: "var(--text)" }}
                dangerouslySetInnerHTML={{ __html: article.content || `<p>${t("common.no_data")}</p>` }}
              />
            </div>
          </article>

          <aside style={{ background: "#fff", borderRadius: 14, padding: 18, boxShadow: "var(--shadow)", border: "1px solid var(--border)", position: "sticky", top: 110 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{t("news.latest")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {latest.filter((item) => item.slug !== article.slug).slice(0, 5).map((item) => (
                <Link key={item.id} href={`/tin-tuc/${item.slug}`} style={{ display: "block", borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "inherit", textDecoration: "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.45, marginBottom: 5 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(item.published_at)}</div>
                </Link>
              ))}
            </div>
            <Link href="/tin-tuc" style={{ ...dmOutline(), marginTop: 16, padding: "7px 12px", fontSize: 12, textDecoration: "none" }}>{t("common.view_all")}</Link>
            <button type="button" style={{ ...dmIcon, marginTop: 12, color: "var(--text-muted)" }}><IC.Share /> {t("news.share")}</button>
          </aside>
        </div>
      </div>
    </div>
  );
}
