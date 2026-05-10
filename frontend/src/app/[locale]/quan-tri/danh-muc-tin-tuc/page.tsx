"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface NewsCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
}

interface CategoryForm {
  originalSlug?: string;
  name: string;
  name_en: string;
  slug: string;
}

const emptyForm: CategoryForm = {
  name: "",
  name_en: "",
  slug: "",
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

async function fetchCategories() {
  const response = await api.get<NewsCategory[] | { results: NewsCategory[] }>("/admin/news-categories/");
  return getResults(response.data);
}

async function saveCategory(values: CategoryForm) {
  const payload = {
    name: values.name,
    name_en: values.name_en,
    slug: values.slug || slugify(values.name),
  };

  if (values.originalSlug) {
    const response = await api.patch<NewsCategory>(`/admin/news-categories/${values.originalSlug}/`, payload);
    return response.data;
  }

  const response = await api.post<NewsCategory>("/admin/news-categories/", payload);
  return response.data;
}

async function deleteCategory(slug: string) {
  await api.delete(`/admin/news-categories/${slug}/`);
}

export default function AdminNewsCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryForm | null>(null);
  const { data: categories = [], isLoading } = useQuery({ queryKey: ["admin-news-categories"], queryFn: fetchCategories, retry: false });

  const saveMutation = useMutation({
    mutationFn: saveCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news-categories"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-news-categories"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editCategory = (category: NewsCategory) => {
    setForm({
      originalSlug: category.slug,
      name: category.name,
      name_en: category.name_en || "",
      slug: category.slug,
    });
  };

  const confirmDelete = (category: NewsCategory) => {
    if (window.confirm(`Xác nhận xóa danh mục tin tức ${category.name}?`)) {
      deleteMutation.mutate(category.slug);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Danh mục tin tức</h2>
        <button type="button" onClick={() => setForm(emptyForm)} style={adminButton("var(--green)")}>+ Thêm danh mục</button>
      </div>

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{form.originalSlug ? "Sửa danh mục" : "Thêm danh mục"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tên danh mục *</label>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Tên EN</label>
              <input value={form.name_en} onChange={(event) => setForm({ ...form, name_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder={slugify(form.name)} style={{ ...inputStyle, width: "100%" }} />
            </div>
          </div>
          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu danh mục. Kiểm tra slug hoặc dữ liệu nhập.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu danh mục"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải danh mục...</div> : (
        <AdminTable
          cols={[
            { key: "name", label: "Tên", render: (row) => <strong>{row.name}</strong> },
            { key: "name_en", label: "Tên EN" },
            { key: "slug", label: "Slug" },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editCategory(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={categories}
        />
      )}
    </>
  );
}
