"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/lib/store";

export interface AdminOrderItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
}

export type AdminOrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";

export interface AdminOrder {
  id: number;
  user: number | null;
  user_email: string;
  order_number: string;
  status: AdminOrderStatus;
  payment_method: string;
  payment_status: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: AdminOrderItem[];
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface AdminStats {
  orders: number;
  revenue: string;
  customers: number;
  products: number;
  recent_orders: AdminOrder[];
  new_users: AdminUser[];
  orders_by_status: Partial<Record<AdminOrderStatus, number>>;
}

const nav = [
  ["dashboard", "📊 Dashboard"],
  ["don-hang", "📦 Đơn hàng"],
  ["danh-gia", "⭐ Đánh giá"],
  ["san-pham", "🌿 Sản phẩm"],
  ["danh-muc", "📁 Danh mục SP"],
  ["cay-trong", "🌾 Cây trồng"],
  ["khuyen-mai", "🎁 Khuyến mãi"],
  ["banner", "🖼 Banner KM"],
  ["tin-tuc", "📰 Tin tức"],
  ["danh-muc-tin-tuc", "📂 Danh mục TT"],
  ["tai-lieu", "📄 Tài liệu"],
  ["danh-muc-tai-lieu", "📂 Danh mục TL"],
  ["nguoi-dung", "👥 Người dùng"],
  ["lien-he", "✉️ Liên hệ"],
  ["cau-hinh", "⚙️ Cấu hình"],
];

export const statusLabel: Record<AdminOrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const statusColor: Record<AdminOrderStatus, string> = {
  pending: "var(--orange)",
  confirmed: "var(--blue)",
  shipping: "var(--orange)",
  delivered: "var(--green)",
  cancelled: "#c0392b",
};

export function AdminStatusPill({ status }: { status: AdminOrderStatus }) {
  return (
    <span style={{ background: `${statusColor[status]}20`, color: statusColor[status], fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 14, whiteSpace: "nowrap" }}>
      {statusLabel[status]}
    </span>
  );
}

export function adminButton(bg = "var(--green)", color = "#fff") {
  return { background: bg, color, border: "none", padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" };
}

export function adminOutline(color = "var(--blue)") {
  return { background: "#fff", color, border: `1.5px solid ${color}`, padding: "8px 13px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font)", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" };
}

export function AdminTable<T extends { id?: number | string }>({ cols, rows, empty = "Không có dữ liệu", onRowClick }: { cols: Array<{ key: string; label: string; render?: (row: T) => ReactNode }>; rows: T[]; empty?: string; onRowClick?: (row: T) => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr style={{ background: "#f8faf5" }}>
            {cols.map((col) => <th key={col.key} style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap" }}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>{empty}</td></tr>}
          {rows.map((row, index) => (
            <tr key={row.id ?? index} onClick={() => onRowClick?.(row)} style={{ borderBottom: "1px solid var(--border)", cursor: onRowClick ? "pointer" : "default" }}>
              {cols.map((col) => <td key={col.key} style={{ padding: "12px 14px", fontSize: 13, verticalAlign: "middle" }}>{col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function fetchAdminStats() {
  const response = await api.get<AdminStats>("/admin/stats/");
  return response.data;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { error, isLoading } = useQuery({ queryKey: ["admin-auth-check"], queryFn: fetchAdminStats, enabled: Boolean(user), retry: false, staleTime: 30_000 });

  useEffect(() => {
    if (!user) {
      router.replace("/dang-nhap?next=/quan-tri/dashboard");
    }
  }, [router, user]);

  useEffect(() => {
    if ((error as AxiosError | null)?.response?.status === 403) {
      router.replace("/dang-nhap");
    }
  }, [error, router]);

  const active = nav.find(([key]) => pathname.includes(`/quan-tri/${key}`))?.[0] || "dashboard";

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.replace("/");
  };

  if (!user || isLoading) {
    return <div style={{ marginTop: -108, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-subtle)", color: "var(--text-muted)" }}>Đang kiểm tra quyền quản trị...</div>;
  }

  return (
    <div style={{ marginTop: -108, minHeight: "100vh", background: "var(--bg-subtle)", display: "grid", gridTemplateColumns: "260px 1fr" }}>
      <aside style={{ background: "#0d1f08", color: "#fff", minHeight: "100vh", padding: 20, position: "sticky", top: 0, alignSelf: "start" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", textDecoration: "none", marginBottom: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ width: 42, height: 42, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>Được Mùa GAH</div>
            <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700 }}>ADMIN CMS</div>
          </div>
        </Link>
        <nav style={{ display: "grid", gap: 6 }}>
          {nav.map(([key, label]) => (
            <Link key={key} href={`/quan-tri/${key}`} style={{ padding: "11px 13px", borderRadius: 10, textDecoration: "none", color: active === key ? "#0d1f08" : "rgba(255,255,255,0.78)", background: active === key ? "#FFE600" : "transparent", fontSize: 14, fontWeight: active === key ? 900 : 700 }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 28, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.08)", fontSize: 12, lineHeight: 1.6 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>{user.displayName || "Admin"}</strong>
          <span style={{ opacity: 0.7, wordBreak: "break-word" }}>{user.email}</span>
        </div>
        <button type="button" onClick={logout} style={{ marginTop: 10, width: "100%", padding: "10px 13px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font)", textAlign: "left" }}>
          Đăng xuất
        </button>
      </aside>
      <section style={{ minWidth: 0 }}>
        <header style={{ height: 64, background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Trang quản trị</div>
          <Link href="/" style={adminOutline()}>Về website</Link>
        </header>
        <main style={{ padding: 26 }}>{children}</main>
      </section>
    </div>
  );
}
