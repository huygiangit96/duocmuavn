"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface AdminBanner {
  id: number;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  image: string;
  link: string;
  tag: string;
  bg_color: string;
  order: number;
  is_active: boolean;
  location: string;
}

interface BannerForm {
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  link: string;
  tag: string;
  bg_color: string;
  order: number;
  is_active: boolean;
  location: string;
}

const emptyForm = (): BannerForm => ({
  title: "",
  title_en: "",
  subtitle: "",
  subtitle_en: "",
  link: "",
  tag: "",
  bg_color: "",
  order: 0,
  is_active: true,
  location: "home",
});

const locLabel: Record<string, string> = {
  home: "Trang chủ",
  products: "Sản phẩm",
  news: "Tin tức",
  documents: "Tài liệu",
};

const locColor: Record<string, { bg: string; color: string }> = {
  home: { bg: "#e8f0fb", color: "var(--blue)" },
  products: { bg: "#f0f7e0", color: "var(--green-dark)" },
  news: { bg: "#fff8e1", color: "#b8860b" },
  documents: { bg: "#f3e8ff", color: "#7c3aed" },
};

export default function AdminBannerPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BannerForm>(emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const r = await api.get<{ results: AdminBanner[] } | AdminBanner[]>("/admin/banners/?page_size=100");
      const d = r.data;
      return Array.isArray(d) ? d : d.results ?? [];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-banners"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("title_en", form.title_en);
      fd.append("subtitle", form.subtitle);
      fd.append("subtitle_en", form.subtitle_en);
      fd.append("link", form.link);
      fd.append("tag", form.tag);
      fd.append("bg_color", form.bg_color);
      fd.append("order", String(form.order));
      fd.append("is_active", String(form.is_active));
      fd.append("location", form.location || "home");
      if (imageFile) fd.append("image", imageFile);
      if (editing) {
        await api.patch(`/admin/banners/${editing.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/banners/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/banners/${id}/`),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: (b: AdminBanner) =>
      api.patch(`/admin/banners/${b.id}/`, { is_active: !b.is_active }),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setPreview("");
    setShowForm(true);
  };

  const openEdit = (b: AdminBanner) => {
    setEditing(b);
    setForm({
      title: b.title,
      title_en: b.title_en,
      subtitle: b.subtitle,
      subtitle_en: b.subtitle_en,
      link: b.link,
      tag: b.tag,
      bg_color: b.bg_color,
      order: b.order,
      is_active: b.is_active,
      location: b.location || "home",
    });
    setImageFile(null);
    setPreview(b.image || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    border: "1.5px solid var(--border)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "var(--font)",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  });

  const cols = [
    {
      key: "image",
      label: "Ảnh",
      render: (b: AdminBanner) =>
        b.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.image} alt="" style={{ width: 90, height: 52, objectFit: "cover", borderRadius: 7 }} />
        ) : (
          <div style={{ width: 90, height: 52, background: b.bg_color || "#e8f4e0", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-muted)" }}>
            {b.bg_color || "—"}
          </div>
        ),
    },
    { key: "title", label: "Tiêu đề" },
    {
      key: "location",
      label: "Vị trí",
      render: (banner: AdminBanner) => (
        <>
          {(banner.location || "home").split(",").map((loc) => {
            const key = loc.trim();
            const style = locColor[key] || { bg: "#f0f0f0", color: "#666" };
            return (
              <span
                key={key}
                style={{
                  display: "inline-block",
                  marginRight: 4,
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  background: style.bg,
                  color: style.color,
                }}
              >
                {locLabel[key] || key}
              </span>
            );
          })}
        </>
      ),
    },
    { key: "tag", label: "Tag" },
    { key: "order", label: "Thứ tự" },
    {
      key: "is_active",
      label: "Hiển thị",
      render: (b: AdminBanner) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(b); }}
          style={{ ...adminOutline(b.is_active ? "var(--green)" : "#999"), padding: "4px 10px", fontSize: 12 }}
        >
          {b.is_active ? "✅ Hiện" : "⏸ Ẩn"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (b: AdminBanner) => (
        <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(b)} style={adminOutline()}>Sửa</button>
          <button
            onClick={() => { if (confirm("Xóa banner này?")) deleteMutation.mutate(b.id); }}
            style={{ ...adminOutline("#c0392b") }}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: 22 }}>🖼 Banner khuyến mãi</h2>
        <button onClick={openCreate} style={adminButton()}>+ Thêm banner</button>
      </div>

      <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
        Banner hiển thị ở đầu trang Sản phẩm. Kéo thả thứ tự qua trường "Thứ tự hiển thị".
      </p>

      {isLoading ? (
        <p style={{ color: "var(--text-muted)" }}>Đang tải...</p>
      ) : (
        <AdminTable<AdminBanner> cols={cols} rows={banners} onRowClick={openEdit} />
      )}

      {/* Modal thêm/sửa */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 18 }}>
              {editing ? "Sửa banner" : "Thêm banner mới"}
            </h3>
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Ảnh */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Ảnh banner
                </label>
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, marginBottom: 8, border: "1px solid var(--border)" }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setImageFile(f);
                    if (f) setPreview(URL.createObjectURL(f));
                  }}
                  style={{ fontSize: 13 }}
                />
              </div>

              {/* Tiêu đề VI / EN */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tiêu đề (VI) *</label>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tiêu đề (EN)</label>
                  <input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} style={inp()} />
                </div>
              </div>

              {/* Phụ đề VI / EN */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Phụ đề (VI)</label>
                  <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Phụ đề (EN)</label>
                  <input value={form.subtitle_en} onChange={(e) => setForm((f) => ({ ...f, subtitle_en: e.target.value }))} style={inp()} />
                </div>
              </div>

              {/* Link + Tag */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Đường dẫn khi click</label>
                  <input type="url" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://..." style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tag nhãn (VD: HOT, KM)</label>
                  <input value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} style={inp()} />
                </div>
              </div>

              {/* Vị trí hiển thị */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Vị trí hiển thị *
                </label>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { value: "home", label: "🏠 Trang chủ" },
                    { value: "products", label: "📦 Trang sản phẩm" },
                    { value: "news", label: "📰 Trang tin tức" },
                    { value: "documents", label: "📄 Trang tài liệu" },
                  ].map(({ value, label }) => {
                    const locations = (form.location || "").split(",").map((s) => s.trim()).filter(Boolean);
                    const checked = locations.includes(value);
                    return (
                      <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = (form.location || "").split(",").map((s) => s.trim()).filter(Boolean);
                            const next = e.target.checked
                              ? [...current.filter((v) => v !== value), value]
                              : current.filter((v) => v !== value);
                            setForm((f) => ({ ...f, location: next.join(",") }));
                          }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
                {!form.location && (
                  <div style={{ fontSize: 11, color: "var(--orange)", marginTop: 4 }}>
                    Chọn ít nhất một vị trí
                  </div>
                )}
              </div>

              {/* Màu nền + Thứ tự */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Màu nền <span style={{ fontWeight: 400 }}>(dùng khi không có ảnh)</span>
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="color"
                      value={form.bg_color && form.bg_color.startsWith("#") ? form.bg_color : "#1e6baa"}
                      onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))}
                      style={{ width: 42, height: 36, borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer", padding: 2 }}
                    />
                    <input
                      value={form.bg_color}
                      onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))}
                      placeholder="#1e6baa hoặc var(--green)"
                      style={inp({ flex: 1 })}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    style={inp()}
                  />
                </div>
              </div>

              {/* Hiển thị */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                Hiển thị trên website
              </label>

              {saveMutation.isError && (
                <div style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, padding: "8px 12px", background: "#fce8ea", borderRadius: 8 }}>
                  Có lỗi xảy ra, vui lòng thử lại.
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={closeForm} style={adminOutline()}>Hủy</button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  style={{ ...adminButton(), opacity: saveMutation.isPending ? 0.7 : 1 }}
                >
                  {saveMutation.isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
