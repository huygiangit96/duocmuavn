"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

type DocumentType = "paper" | "video";

interface DocCategory {
  id: number;
  name: string;
  slug: string;
}

interface AdminPlant {
  id: number;
  name: string;
  slug: string;
}

interface AdminDocument {
  id: number;
  title: string;
  title_en: string;
  slug: string;
  doc_type: DocumentType;
  category: number;
  plants: number[];
  summary: string;
  summary_en: string;
  content: string;
  content_en: string;
  file_url?: string | null;
  file?: string | null;
  video_url: string | null;
  is_published: boolean;
  created_at: string;
}

interface DocumentForm {
  originalSlug?: string;
  title: string;
  title_en: string;
  slug: string;
  doc_type: DocumentType;
  category: string;
  plants: string[];
  summary: string;
  summary_en: string;
  is_published: boolean;
  file_url: string;
  video_url: string;
  content: string;
  content_en: string;
}

const emptyForm: DocumentForm = {
  title: "",
  title_en: "",
  slug: "",
  doc_type: "paper",
  category: "",
  plants: [],
  summary: "",
  summary_en: "",
  is_published: false,
  file_url: "",
  video_url: "",
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

async function fetchDocuments() {
  const response = await api.get<AdminDocument[] | { results: AdminDocument[] }>("/admin/documents/");
  return getResults(response.data);
}

async function fetchCategories() {
  const response = await api.get<DocCategory[] | { results: DocCategory[] }>("/admin/document-categories/");
  return getResults(response.data);
}

async function fetchPlants() {
  const response = await api.get<AdminPlant[] | { results: AdminPlant[] }>("/admin/plants/");
  return getResults(response.data);
}

async function saveDocument(values: DocumentForm) {
  const payload = {
    title: values.title,
    title_en: values.title_en,
    slug: values.slug || slugify(values.title),
    doc_type: values.doc_type,
    category: Number(values.category),
    plants: values.plants.map(Number),
    summary: values.summary,
    summary_en: values.summary_en,
    is_published: values.is_published,
    file_url: values.doc_type === "paper" ? values.file_url : "",
    video_url: values.doc_type === "video" ? values.video_url : "",
    content: values.content,
    content_en: values.content_en,
  };

  if (values.originalSlug) {
    const response = await api.patch<AdminDocument>(`/admin/documents/${values.originalSlug}/`, payload);
    return response.data;
  }

  const response = await api.post<AdminDocument>("/admin/documents/", payload);
  return response.data;
}

async function deleteDocument(slug: string) {
  await api.delete(`/admin/documents/${slug}/`);
}

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DocumentForm | null>(null);
  const { data: documents = [], isLoading } = useQuery({ queryKey: ["admin-documents"], queryFn: fetchDocuments, retry: false });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-document-categories"], queryFn: fetchCategories, retry: false });
  const { data: plants = [] } = useQuery({ queryKey: ["admin-plants"], queryFn: fetchPlants, retry: false });
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);
  const plantMap = useMemo(() => new Map(plants.map((item) => [item.id, item.name])), [plants]);

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-documents"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editDocument = (document: AdminDocument) => {
    setForm({
      originalSlug: document.slug,
      title: document.title,
      title_en: document.title_en || "",
      slug: document.slug,
      doc_type: document.doc_type,
      category: String(document.category),
      plants: (document.plants || []).map(String),
      summary: document.summary || "",
      summary_en: document.summary_en || "",
      is_published: document.is_published,
      file_url: document.file_url || document.file || "",
      video_url: document.video_url || "",
      content: document.content || "",
      content_en: document.content_en || "",
    });
  };

  const togglePlant = (id: string) => {
    if (!form) return;
    setForm({
      ...form,
      plants: form.plants.includes(id)
        ? form.plants.filter((item) => item !== id)
        : [...form.plants, id],
    });
  };

  const confirmDelete = (document: AdminDocument) => {
    if (window.confirm(`Xác nhận xóa tài liệu ${document.title}?`)) {
      deleteMutation.mutate(document.slug);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý tài liệu</h2>
        <button type="button" onClick={() => setForm(emptyForm)} style={adminButton("var(--green)")}>+ Thêm tài liệu</button>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải tài liệu...</div> : (
        <AdminTable
          cols={[
            { key: "title", label: "Tiêu đề", render: (row) => <strong>{row.title}</strong> },
            { key: "doc_type", label: "Loại", render: (row) => <span style={{ background: row.doc_type === "paper" ? "#e8f0fb" : "#fce8ea", color: row.doc_type === "paper" ? "var(--blue)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.doc_type}</span> },
            { key: "category", label: "Danh mục", render: (row) => categoryMap.get(row.category) || row.category },
            { key: "plants", label: "Cây trồng", render: (row) => row.plants?.length ? row.plants.map((id) => plantMap.get(id) || id).join(", ") : "Tất cả" },
            { key: "created_at", label: "Ngày tạo", render: (row) => formatDate(row.created_at) },
            { key: "is_published", label: "Trạng thái", render: (row) => <span style={{ background: row.is_published ? "#f0f7e0" : "#fce8ea", color: row.is_published ? "var(--green-dark)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.is_published ? "published" : "draft"}</span> },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editDocument(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={documents}
        />
      )}

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginTop: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{form.originalSlug ? "Sửa tài liệu" : "Thêm tài liệu"}</h3>

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
                <label style={labelStyle}>Loại tài liệu</label>
                <select value={form.doc_type} onChange={(event) => setForm({ ...form, doc_type: event.target.value as DocumentType })} style={{ ...inputStyle, width: "100%" }}>
                  <option value="paper">paper</option>
                  <option value="video">video</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Danh mục *</label>
                <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Cây trồng</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
                  {plants.map((plant) => (
                    <label key={plant.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700 }}>
                      <input type="checkbox" checked={form.plants.includes(String(plant.id))} onChange={() => togglePlant(String(plant.id))} style={{ accentColor: "var(--green)" }} />
                      {plant.name}
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
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800 }}>
                <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} style={{ accentColor: "var(--green)" }} />
                Đã xuất bản
              </label>
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 900 }}>Nội dung & File</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {form.doc_type === "paper" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>URL file PDF</label>
                  <input value={form.file_url} onChange={(event) => setForm({ ...form, file_url: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
                </div>
              ) : (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>URL video YouTube</label>
                  <input value={form.video_url} onChange={(event) => setForm({ ...form, video_url: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Nội dung mô tả</label>
                <textarea rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Nội dung tiếng Anh</label>
                <textarea rows={8} value={form.content_en} onChange={(event) => setForm({ ...form, content_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
            </div>
          </div>

          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu tài liệu. Kiểm tra tiêu đề, slug, danh mục và nội dung.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu tài liệu"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}
    </>
  );
}
