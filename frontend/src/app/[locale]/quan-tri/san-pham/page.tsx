"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useRef, useMemo, useState } from "react";

import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface ProductImageItem {
  id: number;
  image_url: string;
  order: number;
}

interface AdminCategory {
  id: number;
  name: string;
  slug: string;
}

interface AdminPlant {
  id: number;
  name: string;
  slug: string;
}

interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  category: number;
  plants: number[];
  images: { id: number; image: string; alt: string }[];
  tag: string;
  price: string;
  sale_price: string | null;
  short_desc: string;
  description: string;
  usage: string;
  guide: string;
  specs: Record<string, string>;
  name_en: string;
  short_desc_en: string;
  description_en: string;
  sale_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface ProductForm {
  slug?: string;
  name: string;
  category: string;
  plants: string[];
  price: string;
  sale_price: string;
  tag: string;
  is_active: boolean;
  short_desc: string;
  description: string;
  usage: string;
  guide: string;
  name_en: string;
  short_desc_en: string;
  description_en: string;
  image_urls: string;
  spec_rows: { key: string; value: string }[];
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

const emptyForm: ProductForm = {
  name: "",
  category: "",
  plants: [],
  price: "",
  sale_price: "",
  tag: "",
  is_active: true,
  short_desc: "",
  description: "",
  usage: "",
  guide: "",
  name_en: "",
  short_desc_en: "",
  description_en: "",
  image_urls: "",
  spec_rows: [{ key: "", value: "" }],
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

function specsToRows(specs?: Record<string, string>) {
  const rows = Object.entries(specs || {}).map(([key, value]) => ({ key, value: String(value) }));
  return rows.length ? rows : [{ key: "", value: "" }];
}

function rowsToSpecs(rows: ProductForm["spec_rows"]) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value.trim();
    return acc;
  }, {});
}

function imageUrlsToPayload(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((image, index) => ({ image, alt: `Product image ${index + 1}` }));
}

function productImagesToText(images?: AdminProduct["images"]) {
  return (images || []).map((item) => item.image).filter(Boolean).join("\n");
}

async function fetchProducts(search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const response = await api.get<AdminProduct[] | { results: AdminProduct[] }>(`/admin/products/?${params.toString()}`);
  return getResults(response.data);
}

async function fetchCategories() {
  const response = await api.get<AdminCategory[] | { results: AdminCategory[] }>("/admin/categories/");
  return getResults(response.data);
}

async function fetchPlants() {
  const response = await api.get<AdminPlant[] | { results: AdminPlant[] }>("/admin/plants/");
  return getResults(response.data);
}

async function saveProduct(values: ProductForm) {
  const payload = {
    name: values.name,
    slug: values.slug || slugify(values.name),
    category: Number(values.category),
    plants: values.plants.map(Number),
    price: values.price,
    sale_price: values.sale_price || null,
    tag: values.tag,
    is_active: values.is_active,
    short_desc: values.short_desc,
    description: values.description,
    usage: values.usage,
    guide: values.guide,
    specs: rowsToSpecs(values.spec_rows),
    name_en: values.name_en,
    short_desc_en: values.short_desc_en,
    description_en: values.description_en,
    images: imageUrlsToPayload(values.image_urls),
    sort_order: 0,
  };

  if (values.slug) {
    const response = await api.patch<AdminProduct>(`/admin/products/${values.slug}/`, payload);
    return response.data;
  }

  const response = await api.post<AdminProduct>("/admin/products/", payload);
  return response.data;
}

async function deleteProduct(slug: string) {
  await api.delete(`/admin/products/${slug}/`);
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "desc" | "media">("basic");
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: products = [], isLoading } = useQuery({ queryKey: ["admin-products", search], queryFn: () => fetchProducts(search), retry: false });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories, retry: false });
  const { data: plants = [] } = useQuery({ queryKey: ["admin-plants"], queryFn: fetchPlants, retry: false });
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);
  const plantMap = useMemo(() => new Map(plants.map((item) => [item.id, item.name])), [plants]);

  const saveMutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editProduct = (product: AdminProduct) => {
    setActiveTab("basic");
    setProductImages([]);
    setForm({
      slug: product.slug,
      name: product.name,
      category: String(product.category),
      plants: (product.plants || []).map(String),
      price: product.price,
      sale_price: product.sale_price || "",
      tag: product.tag || "",
      is_active: product.is_active,
      short_desc: product.short_desc || "",
      description: product.description || "",
      usage: product.usage || "",
      guide: product.guide || "",
      name_en: product.name_en || "",
      short_desc_en: product.short_desc_en || "",
      description_en: product.description_en || "",
      image_urls: productImagesToText(product.images),
      spec_rows: specsToRows(product.specs),
    });
    api.get<ProductImageItem[]>(`/admin/products/${product.slug}/images/`).then((res) => {
      setProductImages(Array.isArray(res.data) ? res.data : (res.data as { results: ProductImageItem[] }).results ?? []);
    });
  };

  const startCreate = () => {
    setActiveTab("basic");
    setProductImages([]);
    setForm(emptyForm);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form?.slug) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await api.post<ProductImageItem>(`/admin/products/${form.slug}/images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductImages((prev) => [...prev, res.data]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!form?.slug) return;
    if (!window.confirm("Xóa ảnh này?")) return;
    await api.delete(`/admin/products/${form.slug}/images/${imageId}/`);
    setProductImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const updateSpecRow = (index: number, key: "key" | "value", value: string) => {
    if (!form) return;
    setForm({
      ...form,
      spec_rows: form.spec_rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row),
    });
  };

  const removeSpecRow = (index: number) => {
    if (!form) return;
    const nextRows = form.spec_rows.filter((_, rowIndex) => rowIndex !== index);
    setForm({ ...form, spec_rows: nextRows.length ? nextRows : [{ key: "", value: "" }] });
  };

  const togglePlant = (plantId: string) => {
    if (!form) return;
    setForm({
      ...form,
      plants: form.plants.includes(plantId)
        ? form.plants.filter((item) => item !== plantId)
        : [...form.plants, plantId],
    });
  };

  const confirmDelete = (product: AdminProduct) => {
    if (window.confirm(`Xác nhận xóa sản phẩm ${product.name}?`)) {
      deleteMutation.mutate(product.slug);
    }
  };

  const tabButton = (tab: typeof activeTab, label: string) => ({
    ...adminOutline(activeTab === tab ? "var(--green)" : "var(--border)"),
    background: activeTab === tab ? "#f0f7e0" : "#fff",
    color: activeTab === tab ? "var(--green-dark)" : "var(--text-muted)",
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div><h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý sản phẩm</h2></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm..." style={{ ...inputStyle, minWidth: 220 }} />
          <button type="button" onClick={startCreate} style={adminButton("var(--green)")}>+ Thêm mới</button>
        </div>
      </div>

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>{form.slug ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <button type="button" onClick={() => setActiveTab("basic")} style={tabButton("basic", "Thông tin cơ bản")}>Thông tin cơ bản</button>
            <button type="button" onClick={() => setActiveTab("desc")} style={tabButton("desc", "Mô tả")}>Mô tả</button>
            <button type="button" onClick={() => setActiveTab("media")} style={tabButton("media", "Hình ảnh & Thông số")}>Hình ảnh & Thông số</button>
          </div>

          {activeTab === "basic" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div>
                <label style={labelStyle}>Tên sản phẩm (tiếng Việt) *</label>
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Tên tiếng Anh</label>
                <input value={form.name_en} onChange={(event) => setForm({ ...form, name_en: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Danh mục *</label>
                <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Giá bán *</label>
                <input required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" min="0" style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Giá khuyến mãi</label>
                <input value={form.sale_price} onChange={(event) => setForm({ ...form, sale_price: event.target.value })} type="number" min="0" style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Tag</label>
                <select value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Không tag</option>
                  <option value="Bán chạy">Bán chạy</option>
                  <option value="Mới">Mới</option>
                  <option value="Khuyến mãi">Khuyến mãi</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Cây trồng</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
                  {plants.map((plant) => (
                    <label key={plant.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      <input type="checkbox" checked={form.plants.includes(String(plant.id))} onChange={() => togglePlant(String(plant.id))} style={{ accentColor: "var(--green)" }} />
                      {plant.name}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 800 }}>
                <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} style={{ accentColor: "var(--green)" }} />
                Đang bán
              </label>
            </div>
          )}

          {activeTab === "desc" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              <div>
                <label style={labelStyle}>Mô tả ngắn</label>
                <textarea rows={3} value={form.short_desc} onChange={(event) => setForm({ ...form, short_desc: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Mô tả ngắn tiếng Anh</label>
                <textarea rows={3} value={form.short_desc_en} onChange={(event) => setForm({ ...form, short_desc_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Mô tả chi tiết</label>
                <textarea rows={6} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Mô tả tiếng Anh</label>
                <textarea rows={6} value={form.description_en} onChange={(event) => setForm({ ...form, description_en: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Hướng dẫn sử dụng</label>
                <textarea rows={4} value={form.usage} onChange={(event) => setForm({ ...form, usage: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Hướng dẫn kỹ thuật</label>
                <textarea rows={4} value={form.guide} onChange={(event) => setForm({ ...form, guide: event.target.value })} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr)", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={labelStyle}>Hình ảnh sản phẩm</label>
                  {form.slug ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ ...adminButton("var(--green)"), opacity: uploading ? 0.6 : 1, cursor: uploading ? "not-allowed" : "pointer" }}
                      >
                        {uploading ? "Đang tải..." : "+ Thêm ảnh"}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUploadImage} />
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Lưu sản phẩm trước để upload ảnh</span>
                  )}
                </div>
                {productImages.length === 0 ? (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    Chưa có ảnh nào
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                    {productImages.map((img) => (
                      <div key={img.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "1", background: "#f9fafb" }}>
                        <img src={img.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 4, padding: "1px 7px", cursor: "pointer", fontSize: 13, lineHeight: "20px" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Thông số kỹ thuật</label>
                <div style={{ display: "grid", gap: 8 }}>
                  {form.spec_rows.map((row, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                      <input value={row.key} onChange={(event) => updateSpecRow(index, "key", event.target.value)} placeholder="Tên thông số" style={inputStyle} />
                      <input value={row.value} onChange={(event) => updateSpecRow(index, "value", event.target.value)} placeholder="Giá trị" style={inputStyle} />
                      <button type="button" onClick={() => removeSpecRow(index)} style={adminOutline("#c0392b")}>x</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm({ ...form, spec_rows: [...form.spec_rows, { key: "", value: "" }] })} style={{ ...adminOutline("var(--green)"), width: "fit-content" }}>+ Thêm dòng</button>
                </div>
              </div>
            </div>
          )}

          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu sản phẩm. Kiểm tra slug/danh mục/giá.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu sản phẩm"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải sản phẩm...</div> : (
        <AdminTable
          cols={[
            { key: "name", label: "Tên SP", render: (row) => <strong>{row.name}</strong> },
            { key: "category", label: "Danh mục", render: (row) => categoryMap.get(row.category) || row.category },
            { key: "plants", label: "Cây trồng", render: (row) => row.plants?.length ? row.plants.map((id) => plantMap.get(id) || id).join(", ") : "Tất cả" },
            { key: "price", label: "Giá", render: (row) => <span style={{ color: "var(--blue)", fontWeight: 800 }}>{fmt(Number(row.sale_price || row.price))}</span> },
            { key: "is_active", label: "Trạng thái", render: (row) => <span style={{ background: row.is_active ? "#f0f7e0" : "#fce8ea", color: row.is_active ? "var(--green-dark)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.is_active ? "Đang bán" : "Ẩn"}</span> },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editProduct(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={products}
        />
      )}
    </>
  );
}
