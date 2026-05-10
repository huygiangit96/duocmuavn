"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface AdminCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en: string;
  color: string;
  icon: string;
  product_count: number;
}

interface CategoryForm {
  originalSlug?: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en: string;
  color: string;
  icon: string;
}

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

const emptyForm: CategoryForm = {
  name: "",
  name_en: "",
  slug: "",
  description: "",
  description_en: "",
  color: "#49A035",
  icon: "",
};

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
  const response = await api.get<AdminCategory[] | { results: AdminCategory[] }>("/admin/categories/");
  return getResults(response.data);
}

async function saveCategory(values: CategoryForm) {
  const payload = {
    name: values.name,
    name_en: values.name_en,
    slug: values.slug || slugify(values.name),
    description: values.description,
    description_en: values.description_en,
    color: values.color,
    icon: values.icon,
  };

  if (values.originalSlug) {
    const response = await api.patch<AdminCategory>(`/admin/categories/${values.originalSlug}/`, payload);
    return response.data;
  }

  const response = await api.post<AdminCategory>("/admin/categories/", payload);
  return response.data;
}

async function deleteCategory(slug: string) {
  await api.delete(`/admin/categories/${slug}/`);
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryForm | null>(null);
  const { data: categories = [], isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories, retry: false });

  const saveMutation = useMutation({
    mutationFn: saveCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editCategory = (category: AdminCategory) => {
    setForm({
      originalSlug: category.slug,
      name: category.name,
      name_en: category.name_en || "",
      slug: category.slug,
      description: category.description || "",
      description_en: category.description_en || "",
      color: category.color || "#49A035",
      icon: category.icon || "",
    });
  };

  const confirmDelete = (category: AdminCategory) => {
    if (window.confirm(`Xác nhận xóa danh mục ${category.name}?`)) {
      deleteMutation.mutate(category.slug);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý danh mục sản phẩm</h2>
        </div>
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
            <div>
              <label style={labelStyle}>Màu</label>
              <input type="color" value={form.color || "#49A035"} onChange={(event) => setForm({ ...form, color: event.target.value })} style={{ width: "100%", height: 40, border: "1px solid var(--border)", borderRadius: 8, background: "#fff", padding: 4 }} />
            </div>
            <div>
              <label style={labelStyle}>Icon</label>
              <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Mô tả</label>
              <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Mô tả EN</label>
              <textarea rows={3} value={form.description_en} onChange={(event) => setForm({ ...form, description_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
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
            { key: "product_count", label: "Số sản phẩm", render: (row) => row.product_count ?? 0 },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editCategory(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={categories}
        />
      )}
    </>
  );
}
