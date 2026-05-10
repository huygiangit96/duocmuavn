"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { IC, dmBtn, dmOutline } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import type { Document } from "@/types";

async function fetchDocument(slug: string) {
  const response = await api.get<Document>(`/documents/${slug}/`);
  return response.data;
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function toEmbedUrl(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return url;
  }
  return url;
}

function PdfViewer({ url, title }: { url: string; title: string }) {
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "#525659", boxShadow: "var(--shadow)" }}>
      <iframe
        src={proxyUrl}
        title={title}
        style={{ width: "100%", height: "82vh", minHeight: 520, border: 0, display: "block" }}
      />
    </div>
  );
}

function DetailMedia({ doc }: { doc: Document }) {
  if (doc.doc_type === "video") {
    const embedUrl = toEmbedUrl(doc.video_url);
    if (embedUrl) {
      return (
        <div style={{ aspectRatio: "16 / 9", borderRadius: 16, overflow: "hidden", background: "#0d1f3c", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
          <iframe src={embedUrl} title={doc.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
        </div>
      );
    }

    return (
      <div style={{ aspectRatio: "16 / 9", borderRadius: 16, background: "linear-gradient(135deg, #0d1f3c 0%, #1a3a5a 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "var(--shadow)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.3)" }}><IC.Play /></div>
      </div>
    );
  }

  if (doc.file) {
    return <PdfViewer url={doc.file} title={doc.title} />;
  }

  if (doc.thumbnail) {
    return (
      <div style={{ borderRadius: 16, overflow: "hidden", background: "#f4f7f0", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.thumbnail} alt={doc.title} style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ height: 260, borderRadius: 16, background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
      <div style={{ width: 86, height: 86, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow)" }}><IC.FileText /></div>
    </div>
  );
}

export default function DocumentDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: doc, isLoading, error } = useQuery({ queryKey: ["document", slug], queryFn: () => fetchDocument(slug), enabled: Boolean(slug), retry: false });

  useEffect(() => {
    if ((error as AxiosError | null)?.response?.status === 404) {
      router.replace("/tai-lieu");
    }
  }, [error, router]);

  if (isLoading) {
    return <div style={{ padding: "120px 0", textAlign: "center", color: "var(--text-muted)" }}>{t("common.loading")}</div>;
  }

  if (!doc) {
    return <div style={{ padding: "120px 0", textAlign: "center", color: "var(--text-muted)" }}>{t("common.error")}</div>;
  }

  const typeLabel = doc.doc_type === "video" ? t("docs.video") : t("docs.paper");

  return (
    <div style={{ padding: "0 0 56px", background: "var(--bg-subtle)", minHeight: "100vh" }}>
      <div className="container">
        <div style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t("nav.home")}</Link>
          <IC.ChevR />
          <Link href="/tai-lieu" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t("docs.title")}</Link>
          <IC.ChevR />
          <span style={{ color: "var(--text)" }}>{doc.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 28 }} className="product-detail-grid">
          <article style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ background: doc.doc_type === "video" ? "var(--orange)" : "var(--blue)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "5px 10px", borderRadius: 6 }}>{typeLabel}</span>
                <span style={{ background: "#f0f7e0", color: "var(--green-dark)", fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 6 }}>{doc.category.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{formatDate(doc.created_at)}</span>
              </div>

              <h1 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{doc.title}</h1>
              <p style={{ margin: "0 0 16px", color: "var(--text-muted)", lineHeight: 1.7, fontSize: 15 }}>{doc.summary}</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {doc.doc_type === "paper" && doc.file && (
                  <>
                    <a href={doc.file} target="_blank" rel="noreferrer" style={{ ...dmBtn("var(--blue)"), textDecoration: "none" }}><IC.Eye />{t("docs.view")}</a>
                    <a href={doc.file} download style={{ ...dmBtn("var(--green)"), textDecoration: "none" }}><IC.Download />{t("docs.download")}</a>
                  </>
                )}
                {doc.doc_type === "paper" && !doc.file && (
                  <span style={{ ...dmOutline("var(--text-muted)"), cursor: "not-allowed", opacity: 0.75 }}><IC.FileText />{t("common.no_data")}</span>
                )}
                {doc.doc_type === "video" && doc.video_url && (
                  <a href={doc.video_url} target="_blank" rel="noreferrer" style={{ ...dmBtn("var(--orange)"), textDecoration: "none" }}><IC.Play />{t("docs.video")}</a>
                )}
              </div>
            </div>

            <DetailMedia doc={doc} />

            {doc.content && (
              <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 22, color: "var(--text)", lineHeight: 1.8, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: doc.content }} />
            )}
          </article>

          <aside>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--border)", marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{t("docs.title")}</h3>
              <div style={{ display: "grid", gap: 12, fontSize: 14 }}>
                <div><strong>{t("product.filter")}:</strong> {typeLabel}</div>
                <div><strong>{t("news.categories")}:</strong> {doc.category.name}</div>
                <div><strong>{t("product.plants")}:</strong> {doc.plants.map((item) => item.name).join(", ") || t("product.all")}</div>
                <div><strong>{t("news.published_at")}:</strong> {formatDate(doc.updated_at || doc.created_at)}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #1E5BAA 0%, #0d3878 100%)", borderRadius: 16, padding: 20, color: "#fff" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>{t("home.cta_contact")}</h3>
              <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 1.6 }}>{t("home.banner_sub")}</p>
              <Link href="/lien-he" style={{ ...dmBtn("#FFE600", "#1a1a1a"), textDecoration: "none", width: "100%", justifyContent: "center" }}>{t("contact.title")}</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
