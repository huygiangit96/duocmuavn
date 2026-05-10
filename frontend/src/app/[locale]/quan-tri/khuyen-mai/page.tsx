"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

type DiscountType = "percent" | "fixed";
type PromotionStatus = "active" | "expired" | "upcoming";

interface Promotion {
  id: number;
  code: string;
  name: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_value: string;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

interface PromotionForm {
  id?: number;
  code: string;
  discount_type: DiscountType;
  value: string;
  min_order_value: string;
  valid_from: string;
  valid_to: string;
  max_uses: string;
  is_active: boolean;
}

const emptyForm: PromotionForm = {
  code: "",
  discount_type: "percent",
  value: "",
  min_order_value: "0",
  valid_from: "",
  valid_to: "",
  max_uses: "",
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

async function fetchPromotions() {
  const response = await api.get<Promotion[] | { results: Promotion[] }>("/admin/promotions/");
  return getResults(response.data);
}

async function savePromotion(values: PromotionForm) {
  const code = values.code.trim().toUpperCase();
  const payload = {
    code,
    name: code,
    discount_type: values.discount_type,
    discount_value: values.value,
    min_order_value: values.min_order_value || "0",
    start_date: values.valid_from,
    end_date: values.valid_to,
    usage_limit: values.max_uses ? Number(values.max_uses) : null,
    is_active: values.is_active,
  };

  if (values.id) {
    const response = await api.patch<Promotion>(`/admin/promotions/${values.id}/`, payload);
    return response.data;
  }

  const response = await api.post<Promotion>("/admin/promotions/", payload);
  return response.data;
}

async function deletePromotion(id: number) {
  await api.delete(`/admin/promotions/${id}/`);
}

function getPromotionStatus(promotion: Promotion): PromotionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(promotion.start_date);
  const end = new Date(promotion.end_date);

  if (start > today) return "upcoming";
  if (end < today || !promotion.is_active) return "expired";
  return "active";
}

function statusBadge(status: PromotionStatus) {
  const style = {
    active: { text: "Đang hoạt động", bg: "#f0f7e0", color: "var(--green-dark)" },
    expired: { text: "Hết hạn", bg: "#f1f3f5", color: "var(--text-muted)" },
    upcoming: { text: "Chưa bắt đầu", bg: "#fff4df", color: "var(--orange)" },
  }[status];

  return <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{style.text}</span>;
}

function formatValue(promotion: Promotion) {
  if (promotion.discount_type === "percent") return `${promotion.discount_value}%`;
  return fmt(Number(promotion.discount_value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(value));
}

export default function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PromotionForm | null>(null);
  const { data: promotions = [], isLoading } = useQuery({ queryKey: ["admin-promotions"], queryFn: fetchPromotions, retry: false });

  const saveMutation = useMutation({
    mutationFn: savePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setForm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promotions"] }),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form) saveMutation.mutate(form);
  };

  const editPromotion = (promotion: Promotion) => {
    setForm({
      id: promotion.id,
      code: promotion.code,
      discount_type: promotion.discount_type,
      value: promotion.discount_value,
      min_order_value: promotion.min_order_value,
      valid_from: promotion.start_date,
      valid_to: promotion.end_date,
      max_uses: promotion.usage_limit == null ? "" : String(promotion.usage_limit),
      is_active: promotion.is_active,
    });
  };

  const confirmDelete = (promotion: Promotion) => {
    if (window.confirm(`Xác nhận xóa khuyến mãi ${promotion.code}?`)) {
      deleteMutation.mutate(promotion.id);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý khuyến mãi</h2>
        <button type="button" onClick={() => setForm(emptyForm)} style={adminButton("var(--green)")}>+ Thêm khuyến mãi</button>
      </div>

      {form && (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 900 }}>{form.id ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <Field label="Mã khuyến mãi *">
              <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} style={{ ...inputStyle, width: "100%", textTransform: "uppercase" }} />
            </Field>
            <Field label="Loại giảm">
              <select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value as DiscountType })} style={{ ...inputStyle, width: "100%" }}>
                <option value="percent">percent</option>
                <option value="fixed">fixed</option>
              </select>
            </Field>
            <Field label="Giá trị giảm">
              <input required type="number" min="0" max={form.discount_type === "percent" ? 100 : undefined} value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </Field>
            <Field label="Đơn hàng tối thiểu">
              <input type="number" min="0" value={form.min_order_value} onChange={(event) => setForm({ ...form, min_order_value: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </Field>
            <Field label="Ngày bắt đầu">
              <input required type="date" value={form.valid_from} onChange={(event) => setForm({ ...form, valid_from: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </Field>
            <Field label="Ngày kết thúc">
              <input required type="date" value={form.valid_to} onChange={(event) => setForm({ ...form, valid_to: event.target.value })} style={{ ...inputStyle, width: "100%" }} />
            </Field>
            <Field label="Số lượt sử dụng tối đa">
              <input type="number" min="0" value={form.max_uses} onChange={(event) => setForm({ ...form, max_uses: event.target.value })} placeholder="Không giới hạn" style={{ ...inputStyle, width: "100%" }} />
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800 }}>
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} style={{ accentColor: "var(--green)" }} />
              Đang kích hoạt
            </label>
          </div>
          {saveMutation.isError && <div style={{ color: "#c0392b", marginTop: 12, fontSize: 13, fontWeight: 700 }}>Không thể lưu khuyến mãi. Kiểm tra mã, ngày hiệu lực và giá trị giảm.</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={saveMutation.isPending} style={adminButton("var(--green)")}>{saveMutation.isPending ? "Đang lưu..." : "Lưu khuyến mãi"}</button>
            <button type="button" onClick={() => setForm(null)} style={adminOutline()}>Hủy</button>
          </div>
        </form>
      )}

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải khuyến mãi...</div> : (
        <AdminTable
          cols={[
            { key: "code", label: "Mã", render: (row) => <strong style={{ color: "var(--blue)" }}>{row.code}</strong> },
            { key: "discount_type", label: "Loại giảm", render: (row) => row.discount_type === "percent" ? "%" : "Cố định" },
            { key: "discount_value", label: "Giá trị", render: (row) => formatValue(row) },
            { key: "min_order_value", label: "Đơn tối thiểu", render: (row) => fmt(Number(row.min_order_value)) },
            { key: "validity", label: "Hiệu lực", render: (row) => `${formatDate(row.start_date)} - ${formatDate(row.end_date)}` },
            { key: "is_active", label: "Trạng thái", render: (row) => statusBadge(getPromotionStatus(row)) },
            { key: "actions", label: "Thao tác", render: (row) => <div style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => editPromotion(row)} style={adminOutline()}>Sửa</button><button type="button" onClick={() => confirmDelete(row)} style={adminOutline("#c0392b")}>Xóa</button></div> },
          ]}
          rows={promotions}
        />
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
