"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { BannerSlider } from "@/components/BannerSlider";
import { IC, dmBtn, dmInput, dmOutline } from "@/components/icons";
import { Pagination } from "@/components/Pagination";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import type { DocCategory, Document, PaginatedResponse, Plant } from "@/types";

const PAGE_SIZE = 9;

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

const getResults = <T,>(data: T[] | PaginatedResponse<T>) => Array.isArray(data) ? data : data.results;

async function fetchDocuments(params: URLSearchParams) {
  const response = await api.get<PaginatedResponse<Document>>(`/documents/?${params.toString()}`);
  return response.data;
}

async function fetchCategories() {
  const response = await api.get<DocCategory[] | PaginatedResponse<DocCategory>>("/document-categories/");
  return getResults(response.data);
}

async function fetchPlants() {
  const response = await api.get<Plant[] | PaginatedResponse<Plant>>("/plants/");
  return getResults(response.data);
}

async function fetchDocBanners() {
  const response = await api.get<{ results?: SliderBanner[] } | SliderBanner[]>(
    "/banners/?location=documents"
  );
  const data = response.data;
  const results = Array.isArray(data) ? data : (data.results ?? []);
  return results.filter((b: { is_active: boolean }) => b.is_active);
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function DocThumb({ doc }: { doc: Document }) {
  if (doc.thumbnail) {
    return (
      <div style={{ height: 158, background: "#f4f7f0", overflow: "hidden", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.thumbnail} alt={doc.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {doc.doc_type === "video" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,0.35)" }}><IC.Play /></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: 158, background: doc.doc_type === "video" ? "linear-gradient(135deg, #0d1f3c 0%, #1a3a5a 100%)" : "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {doc.doc_type === "video" ? (
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,0.3)" }}><IC.Play /></div>
      ) : (
        <div style={{ width: 56, height: 56, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", boxShadow: "var(--shadow)" }}><IC.FileText /></div>
      )}
    </div>
  );
}

function DocumentsContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");

  const docType = searchParams.get("doc_type") || "paper";
  const category = searchParams.get("category") || "";
  const plant = searchParams.get("plants") || "";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || "1");

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    router.push(`/tai-lieu?${next.toString()}`);
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page_size", String(PAGE_SIZE));
    params.set("page", String(page));
    params.set("doc_type", docType);
    if (category) params.set("category", category);
    if (plant) params.set("plants", plant);
    if (search) params.set("search", search);
    return params;
  }, [category, docType, page, plant, search]);

  const { data, isLoading, isError } = useQuery({ queryKey: ["documents", queryParams.toString()], queryFn: () => fetchDocuments(queryParams), retry: false });
  const { data: categories = [] } = useQuery({ queryKey: ["document-categories"], queryFn: fetchCategories, retry: false });
  const { data: plants = [] } = useQuery({ queryKey: ["document-plants"], queryFn: fetchPlants, retry: false });
  const { data: docBanners = [] } = useQuery({ queryKey: ["doc-banners"], queryFn: fetchDocBanners, retry: false });

  const documents = data?.results || [];
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  const submitSearch = () => updateParam("search", searchText.trim() || null);

  return (
    <div style={{ padding: "0 0 56px" }}>
      <div className="container">
        <BannerSlider banners={docBanners} />
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 5px" }}>{t("docs.title")}</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>{t("home.banner_sub")}</p>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 22 }}>
          {[
            ["paper", <IC.FileText key="paper" />, t("docs.paper")],
            ["video", <IC.Video key="video" />, t("docs.video")],
          ].map(([key, icon, label]) => (
            <button key={String(key)} type="button" onClick={() => updateParam("doc_type", String(key))} style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 22px", background: "none", border: "none", cursor: "pointer", fontWeight: docType === key ? 800 : 500, fontSize: 14, color: docType === key ? "var(--blue)" : "var(--text-muted)", borderBottom: docType === key ? "3px solid var(--blue)" : "3px solid transparent", marginBottom: -2, fontFamily: "var(--font)", transition: "all 0.2s" }}>{icon}{label}</button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ width: 240, position: "relative" }}>
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitSearch(); }} placeholder={t("docs.search_placeholder")} style={{ ...dmInput, paddingRight: 42 }} />
              <button type="button" onClick={submitSearch} style={{ position: "absolute", right: 5, top: 5, ...dmOutline(), padding: 8, borderWidth: 0 }} aria-label={t("common.search")}><IC.Search /></button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>{t("news.categories")}</label>
            <select value={category} onChange={(event) => updateParam("category", event.target.value || null)} style={{ ...dmInput, width: 190 }}>
              <option value="">{t("product.all")}</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>{t("product.plants")}</span>
            <button type="button" onClick={() => updateParam("plants", null)} style={{ padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, border: "1.5px solid", borderColor: !plant ? "var(--green)" : "var(--border)", background: !plant ? "#f0f7e0" : "#fff", color: !plant ? "var(--green-dark)" : "var(--text)", fontFamily: "var(--font)" }}>{t("product.all")}</button>
            {plants.map((item) => (
              <button key={item.id} type="button" onClick={() => updateParam("plants", plant === item.slug ? null : item.slug)} style={{ padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, border: "1.5px solid", borderColor: plant === item.slug ? "var(--green)" : "var(--border)", background: plant === item.slug ? "#f0f7e0" : "#fff", color: plant === item.slug ? "var(--green-dark)" : "var(--text)", transition: "all 0.2s", fontFamily: "var(--font)" }}>{item.name}</button>
            ))}
          </div>
        </div>

        {isLoading && <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>{t("common.loading")}</div>}
        {isError && <div style={{ padding: 32, textAlign: "center", color: "var(--orange)" }}>{t("common.error")}</div>}

        {!isLoading && !isError && docType === "paper" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <div style={{ width: 48, height: 48, background: "#e8f0fb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}><IC.FileText /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/tai-lieu/${doc.slug}`} style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text)", textDecoration: "none", display: "block" }}>{doc.title}</Link>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.category.name} · {t("product.plants")}: {doc.plants.map((item) => item.name).join(", ") || t("product.all")} · {formatDate(doc.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <Link href={`/tai-lieu/${doc.slug}`} style={{ ...dmOutline(), padding: "8px 13px", fontSize: 12, textDecoration: "none" }}><IC.Eye />{t("docs.view")}</Link>
                  {doc.file && <a href={doc.file} style={{ ...dmBtn("var(--green)"), padding: "8px 13px", fontSize: 12, textDecoration: "none" }}><IC.Download />{t("docs.download")}</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && docType === "video" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 18 }}>
            {documents.map((doc) => (
              <Link key={doc.id} href={`/tai-lieu/${doc.slug}`} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid var(--border)", cursor: "pointer", transition: "transform 0.25s", textDecoration: "none", color: "inherit" }}>
                <DocThumb doc={doc} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, lineHeight: 1.4 }}>{doc.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.category.name} · {doc.plants.map((item) => item.name).join(", ") || t("product.all")}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <div style={{ marginTop: 18, background: "#fff", border: "1px dashed var(--border)", borderRadius: 14, padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
            {t("common.no_data")}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => updateParam("page", String(nextPage))} />
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const t = useTranslations();

  return (
    <Suspense fallback={<div style={{ padding: "120px 0", textAlign: "center", color: "var(--text-muted)" }}>{t("common.loading")}</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
