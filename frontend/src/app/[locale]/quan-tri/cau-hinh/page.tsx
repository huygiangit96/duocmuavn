"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface SiteConfig {
  id: number;
  hotline: string;
  email: string;
  address: string;
  zalo_url: string;
  google_map_embed: string;
  tagline: string;
  tagline_en: string;
  about: string;
  about_en: string;
}

interface SiteConfigForm {
  hotline: string;
  email: string;
  address: string;
  zalo_url: string;
  google_map_embed: string;
  tagline: string;
  tagline_en: string;
  about: string;
  about_en: string;
}

interface Banner {
  id: number;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  image_url?: string;
  image?: string;
  link_url?: string;
  link?: string;
  sort_order?: number;
  order?: number;
  is_active: boolean;
}

interface BannerForm {
  id?: number;
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  image_url: string;
  link_url: string;
  sort_order: string;
  is_active: boolean;
}

type ActiveSection = "site" | "banners";

const emptySiteForm: SiteConfigForm = {
  hotline: "",
  email: "",
  address: "",
  zalo_url: "",
  google_map_embed: "",
  tagline: "",
  tagline_en: "",
  about: "",
  about_en: "",
};

const emptyBannerForm: BannerForm = {
  title: "",
  title_en: "",
  subtitle: "",
  subtitle_en: "",
  image_url: "",
  link_url: "",
  sort_order: "0",
  is_active: true,
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

async function fetchSiteConfigs() {
  const response = await api.get<SiteConfig[] | { results: SiteConfig[] }>("/admin/site-config/");
  return getResults(response.data);
}

async function patchSiteConfig(id: number, values: SiteConfigForm) {
  const response = await api.patch<SiteConfig>(`/admin/site-config/${id}/`, values);
  return response.data;
}

async function fetchBanners() {
  const response = await api.get<Banner[] | { results: Banner[] }>("/admin/banners/");
  return getResults(response.data);
}

async function saveBanner(values: BannerForm) {
  const payload = {
    title: values.title,
    title_en: values.title_en,
    subtitle: values.subtitle,
    subtitle_en: values.subtitle_en,
    image_url: values.image_url,
    link_url: values.link_url,
    sort_order: Number(values.sort_order || 0),
    is_active: values.is_active,
  };

  if (values.id) {
    const response = await api.patch<Banner>(`/admin/banners/${values.id}/`, payload);
    return response.data;
  }

  const response = await api.post<Banner>("/admin/banners/", payload);
  return response.data;
}

async function deleteBanner(id: number) {
  await api.delete(`/admin/banners/${id}/`);
}

function bannerImage(banner: Banner) {
  return banner.image_url || banner.image || "";
}

function bannerLink(banner: Banner) {
  return banner.link_url || banner.link || "";
}

function bannerOrder(banner: Banner) {
  return banner.sort_order ?? banner.order ?? 0;
}

export default function AdminConfigPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<ActiveSection>("site");
  const [siteForm, setSiteForm] = useState<SiteConfigForm>(emptySiteForm);
  const [bannerForm, setBannerForm] = useState<BannerForm | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { data: siteConfigs = [] } = useQuery({ queryKey: ["admin-site-config"], queryFn: fetchSiteConfigs, retry: false });
  const { data: banners = [], isLoading: bannersLoading } = useQuery({ queryKey: ["admin-banners"], queryFn: fetchBanners, retry: false });
  const siteConfig = siteConfigs[0];

  useEffect(() => {
    if (!siteConfig) return;
    setSiteForm({
      hotline: siteConfig.hotline || "",
      email: siteConfig.email || "",
      address: siteConfig.address || "",
      zalo_url: siteConfig.zalo_url || "",
      google_map_embed: siteConfig.google_map_embed || "",
      tagline: siteConfig.tagline || "",
      tagline_en: siteConfig.tagline_en || "",
      about: siteConfig.about || "",
      about_en: siteConfig.about_en || "",
    });
  }, [siteConfig]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const siteMutation = useMutation({
    mutationFn: () => patchSiteConfig(siteConfig.id, siteForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-config"] });
      showToast("success", "Đã lưu cấu hình website.");
    },
    onError: () => showToast("error", "Không thể lưu cấu hình website."),
  });

  const bannerMutation = useMutation({
    mutationFn: saveBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      setBannerForm(null);
      showToast("success", "Đã lưu banner.");
    },
    onError: () => showToast("error", "Không thể lưu banner."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      showToast("success", "Đã xóa banner.");
    },
    onError: () => showToast("error", "Không thể xóa banner."),
  });

  const submitSite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!siteConfig) {
      showToast("error", "Chưa có bản ghi cấu hình website.");
      return;
    }
    siteMutation.mutate();
  };

  const submitBanner = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bannerForm) bannerMutation.mutate(bannerForm);
  };

  const editBanner = (banner: Banner) => {
    setBannerForm({
      id: banner.id,
      title: banner.title,
      title_en: banner.title_en || "",
      subtitle: banner.subtitle || "",
      subtitle_en: banner.subtitle_en || "",
      image_url: bannerImage(banner),
      link_url: bannerLink(banner),
      sort_order: String(bannerOrder(banner)),
      is_active: banner.is_active,
    });
  };

  const confirmDelete = (banner: Banner) => {
    if (window.confirm(`Xác nhận xóa banner ${banner.title}?`)) {
      deleteMutation.mutate(banner.id);
    }
  };

  const tabStyle = (section: ActiveSection) => ({
    ...adminOutline(activeSection === section ? "var(--green)" : "var(--border)"),
    background: activeSection === section ? "#f0f7e0" : "#fff",
    color: activeSection === section ? "var(--green-dark)" : "var(--text-muted)",
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Cấu hình hệ thống</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setActiveSection("site")} style={tabStyle("site")}>Cấu hình Website</button>
          <button type="button" onClick={() => setActiveSection("banners")} style={tabStyle("banners")}>Quản lý Banner</button>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", right: 24, top: 82, zIndex: 80, background: toast.type === "success" ? "var(--green)" : "#c0392b", color: "#fff", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 800, boxShadow: "0 14px 36px rgba(0,0,0,0.16)" }}>
          {toast.message}
        </div>
      )}

      {activeSection === "site" && (
        <form onSubmit={submitSite} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 900 }}>Cấu hình Website</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <Field label="Hotline"><input value={siteForm.hotline} onChange={(event) => setSiteForm({ ...siteForm, hotline: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <Field label="Email"><input type="email" value={siteForm.email} onChange={(event) => setSiteForm({ ...siteForm, email: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <Field label="Zalo URL"><input value={siteForm.zalo_url} onChange={(event) => setSiteForm({ ...siteForm, zalo_url: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <Field label="Google Map embed URL"><input value={siteForm.google_map_embed} onChange={(event) => setSiteForm({ ...siteForm, google_map_embed: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <Field label="Slogan tiếng Việt"><input value={siteForm.tagline} onChange={(event) => setSiteForm({ ...siteForm, tagline: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <Field label="Slogan tiếng Anh"><input value={siteForm.tagline_en} onChange={(event) => setSiteForm({ ...siteForm, tagline_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Địa chỉ"><textarea rows={3} value={siteForm.address} onChange={(event) => setSiteForm({ ...siteForm, address: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} /></Field>
            </div>
            <Field label="Giới thiệu tiếng Việt"><textarea rows={5} value={siteForm.about} onChange={(event) => setSiteForm({ ...siteForm, about: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} /></Field>
            <Field label="Giới thiệu tiếng Anh"><textarea rows={5} value={siteForm.about_en} onChange={(event) => setSiteForm({ ...siteForm, about_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} /></Field>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={siteMutation.isPending || !siteConfig} style={adminButton("var(--green)")}>{siteMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}</button>
          </div>
        </form>
      )}

      {activeSection === "banners" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setBannerForm(emptyBannerForm)} style={adminButton("var(--green)")}>+ Thêm banner</button>
          </div>

          {bannersLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải banner...</div> : (
            <AdminTable
              cols={[
                { key: "title", label: "Tiêu đề", render: (row) => <strong>{row.title}</strong> },
                { key: "title_en", label: "Tiêu đề EN" },
                { key: "image", label: "URL ảnh", render: (row) => bannerImage(row) ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><img src={bannerImage(row)} alt="" style={{ width: 58, height: 34, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} /><span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-muted)" }}>{bannerImage(row)}</span></div> : "-" },
                { key: "sort_order", label: "Thứ tự", render: (row) => bannerOrder(row) },
                { key: "is_active", label: "Trạng thái", render: (row) => <span style={{ background: row.is_active ? "#f0f7e0" : "#fce8ea", color: row.is_active ? "var(--green-dark)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.is_active ? "active" : "inactive"}</span> },
                { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editBanner(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
              ]}
              rows={banners}
            />
          )}

          {bannerForm && (
            <form onSubmit={submitBanner} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 900 }}>{bannerForm.id ? "Sửa banner" : "Thêm banner"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                <Field label="Tiêu đề"><input value={bannerForm.title} onChange={(event) => setBannerForm({ ...bannerForm, title: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <Field label="Tiêu đề EN"><input value={bannerForm.title_en} onChange={(event) => setBannerForm({ ...bannerForm, title_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <Field label="Subtitle"><input value={bannerForm.subtitle} onChange={(event) => setBannerForm({ ...bannerForm, subtitle: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <Field label="Subtitle EN"><input value={bannerForm.subtitle_en} onChange={(event) => setBannerForm({ ...bannerForm, subtitle_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <Field label="Link URL"><input value={bannerForm.link_url} onChange={(event) => setBannerForm({ ...bannerForm, link_url: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <Field label="Thứ tự"><input type="number" value={bannerForm.sort_order} onChange={(event) => setBannerForm({ ...bannerForm, sort_order: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 140px", gap: 12, alignItems: "end" }}>
                  <Field label="Image URL"><input value={bannerForm.image_url} onChange={(event) => setBannerForm({ ...bannerForm, image_url: event.target.value })} style={{ ...inputStyle, width: "100%" }} /></Field>
                  {bannerForm.image_url ? <img src={bannerForm.image_url} alt="" style={{ width: 140, height: 78, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} /> : <div style={{ width: 140, height: 78, borderRadius: 8, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>Preview</div>}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800 }}>
                  <input type="checkbox" checked={bannerForm.is_active} onChange={(event) => setBannerForm({ ...bannerForm, is_active: event.target.checked })} style={{ accentColor: "var(--green)" }} />
                  Active
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={bannerMutation.isPending} style={adminButton("var(--green)")}>{bannerMutation.isPending ? "Đang lưu..." : "Lưu banner"}</button>
                <button type="button" onClick={() => setBannerForm(null)} style={adminOutline()}>Hủy</button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}
