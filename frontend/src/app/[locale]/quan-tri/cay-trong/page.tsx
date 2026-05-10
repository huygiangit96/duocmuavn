"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface AdminPlant {
  id: number;
  name: string;
  name_en: string;
  slug: string;
}

interface PlantForm {
  originalSlug?: string;
  name: string;
  name_en: string;
  slug: string;
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

const emptyForm: PlantForm = {
  name: "",
  name_en: "",
  slug: "",
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

async function fetchPlants() {
  const response = await api.get<AdminPlant[] | { results: AdminPlant[] }>("/admin/plants/");
  return getResults(response.data);
}

async function savePlant(values: PlantForm) {
  const payload = {
    name: values.name,
    name_en: values.name_en,
    slug: values.slug || slugify(values.name),
  };

  if (values.originalSlug) {
    const response = await api.patch<AdminPlant>(`/admin/plants/${values.originalSlug}/`, payload);
    return response.data;
  }

  const response = await api.post<AdminPlant>("/admin/plants/", payload);
  return response.data;
}

async function deletePlant(slug: string) {
  await api.delete(`/admin/plants/${slug}/`);
}

export default function AdminPlantsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PlantForm | null>(null);
  const { data: plants = [], isLoading } = useQuery({ queryKey: ["admin-plants"], queryFn: fetchPlants, retry: false });

  const saveMutation = useMutation({
    mutationFn: savePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plants"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editPlant = (plant: AdminPlant) => {
    setForm({
      originalSlug: plant.slug,
      name: plant.name,
      name_en: plant.name_en || "",
      slug: plant.slug,
    });
  };

  const confirmDelete = (plant: AdminPlant) => {
    if (window.confirm(`Xác nhận xóa cây trồng ${plant.name}?`)) {
      deleteMutation.mutate(plant.slug);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý cây trồng</h2>
        </div>
        <button type="button" onClick={() => setForm(emptyForm)} style={adminButton("var(--green)")}>+ Thêm cây trồng</button>
      </div>

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{form.originalSlug ? "Sửa cây trồng" : "Thêm cây trồng"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tên cây trồng *</label>
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
          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu cây trồng. Kiểm tra slug hoặc dữ liệu nhập.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu cây trồng"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải cây trồng...</div> : (
        <AdminTable
          cols={[
            { key: "name", label: "Tên", render: (row) => <strong>{row.name}</strong> },
            { key: "name_en", label: "Tên EN" },
            { key: "slug", label: "Slug" },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editPlant(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={plants}
        />
      )}
    </>
  );
}
