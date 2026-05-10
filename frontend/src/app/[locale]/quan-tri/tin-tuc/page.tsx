"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

interface Hashtag {
  id: number;
  name: string;
}

interface AdminArticle {
  id: number;
  title: string;
  title_en: string;
  slug: string;
  category: number;
  hashtags: number[];
  thumbnail: string;
  summary: string;
  summary_en: string;
  content: string;
  content_en: string;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
}

interface ArticleForm {
  originalSlug?: string;
  title: string;
  title_en: string;
  slug: string;
  category: string;
  hashtags: string[];
  summary: string;
  summary_en: string;
  thumbnail: string;
  is_published: boolean;
  content: string;
  content_en: string;
}

const emptyForm: ArticleForm = {
  title: "",
  title_en: "",
  slug: "",
  category: "",
  hashtags: [],
  summary: "",
  summary_en: "",
  thumbnail: "",
  is_published: false,
  content: "",
  content_en: "",
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font)",
  fontSize: 13,
  outline: "none",
} as const;

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--text-muted)",
  marginBottom: 6,
} as const;

const getResults = <T,>(data: T[] | { results: T[] }) => Array.isArray(data) ? data : data.results;

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string | null) {
  if (!value) return "Chưa đăng";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

async function fetchArticles() {
  const response = await api.get<AdminArticle[] | { results: AdminArticle[] }>("/admin/news/");
  return getResults(response.data);
}

async function fetchCategories() {
  const response = await api.get<NewsCategory[] | { results: NewsCategory[] }>("/admin/news-categories/");
  return getResults(response.data);
}

async function fetchHashtags() {
  const response = await api.get<Hashtag[] | { results: Hashtag[] }>("/admin/hashtags/");
  return getResults(response.data);
}

async function saveArticle(values: ArticleForm) {
  const payload = {
    title: values.title,
    title_en: values.title_en,
    slug: values.slug || slugify(values.title),
    category: Number(values.category),
    hashtags: values.hashtags.map(Number),
    summary: values.summary,
    summary_en: values.summary_en,
    thumbnail: values.thumbnail,
    is_published: values.is_published,
    content: values.content,
    content_en: values.content_en,
  };

  if (values.originalSlug) {
    const response = await api.patch<AdminArticle>(`/admin/news/${values.originalSlug}/`, payload);
    return response.data;
  }

  const response = await api.post<AdminArticle>("/admin/news/", payload);
  return response.data;
}

async function deleteArticle(slug: string) {
  await api.delete(`/admin/news/${slug}/`);
}

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ArticleForm | null>(null);
  const { data: articles = [], isLoading } = useQuery({ queryKey: ["admin-news"], queryFn: fetchArticles, retry: false });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-news-categories"], queryFn: fetchCategories, retry: false });
  const { data: hashtags = [] } = useQuery({ queryKey: ["admin-hashtags"], queryFn: fetchHashtags, retry: false });
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);

  const saveMutation = useMutation({
    mutationFn: saveArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-news"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editArticle = (article: AdminArticle) => {
    setForm({
      originalSlug: article.slug,
      title: article.title,
      title_en: article.title_en || "",
      slug: article.slug,
      category: String(article.category),
      hashtags: (article.hashtags || []).map(String),
      summary: article.summary || "",
      summary_en: article.summary_en || "",
      thumbnail: article.thumbnail || "",
      is_published: article.is_published,
      content: article.content || "",
      content_en: article.content_en || "",
    });
  };

  const toggleHashtag = (id: string) => {
    if (!form) return;
    setForm({
      ...form,
      hashtags: form.hashtags.includes(id)
        ? form.hashtags.filter((item) => item !== id)
        : [...form.hashtags, id],
    });
  };

  const confirmDelete = (article: AdminArticle) => {
    if (window.confirm(`Xác nhận xóa bài viết ${article.title}?`)) {
      deleteMutation.mutate(article.slug);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý tin tức</h2>
        <button type="button" onClick={() => setForm(emptyForm)} style={adminButton("var(--green)")}>+ Thêm bài viết</button>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải tin tức...</div> : (
        <AdminTable
          cols={[
            { key: "title", label: "Tiêu đề", render: (row) => <strong>{row.title}</strong> },
            { key: "category", label: "Danh mục", render: (row) => categoryMap.get(row.category) || row.category },
            { key: "published_at", label: "Ngày đăng", render: (row) => formatDate(row.published_at || row.created_at) },
            { key: "view_count", label: "Lượt xem" },
            { key: "status", label: "Trạng thái", render: (row) => <span style={{ background: row.is_published ? "#f0f7e0" : "#fce8ea", color: row.is_published ? "var(--green-dark)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.is_published ? "published" : "draft"}</span> },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editArticle(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={articles}
        />
      )}

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginTop: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{form.originalSlug ? "Sửa bài viết" : "Thêm bài viết"}</h3>
          <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 900 }}>Thông tin cơ bản</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <div>
                <label style={labelStyle}>Tiêu đề *</label>
                <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Tiêu đề tiếng Anh</label>
                <input value={form.title_en} onChange={(event) => setForm({ ...form, title_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder={slugify(form.title)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Danh mục *</label>
                <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Hashtag</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
                  {hashtags.map((tag) => (
                    <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700 }}>
                      <input type="checkbox" checked={form.hashtags.includes(String(tag.id))} onChange={() => toggleHashtag(String(tag.id))} style={{ accentColor: "var(--green)" }} />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tóm tắt</label>
                <textarea rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Tóm tắt tiếng Anh</label>
                <textarea rows={3} value={form.summary_en} onChange={(event) => setForm({ ...form, summary_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>URL ảnh đại diện</label>
                <input value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800 }}>
                <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} style={{ accentColor: "var(--green)" }} />
                Đã xuất bản
              </label>
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 900 }}>Nội dung</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              <div>
                <label style={labelStyle}>Nội dung HTML</label>
                <textarea rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Nội dung HTML tiếng Anh</label>
                <textarea rows={12} value={form.content_en} onChange={(event) => setForm({ ...form, content_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
            </div>
          </div>

          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu bài viết. Kiểm tra tiêu đề, slug, danh mục và nội dung.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu bài viết"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}
    </>
  );
}
