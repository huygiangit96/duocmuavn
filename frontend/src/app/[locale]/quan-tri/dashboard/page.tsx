"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { AdminStats, AdminStatusPill, AdminTable, statusLabel } from "../AdminShell";

async function fetchStats() {
  const response = await api.get<AdminStats>("/admin/stats/");
  return response.data;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats, retry: false });

  if (isLoading) return <div style={{ color: "var(--text-muted)" }}>Đang tải dashboard...</div>;
  if (isError || !stats) return <div style={{ color: "var(--orange)" }}>Không thể tải dữ liệu dashboard.</div>;

  const cards = [
    { label: "Tổng đơn hàng", value: stats.orders, sub: "Tất cả đơn đã ghi nhận", color: "var(--blue)" },
    { label: "Doanh thu", value: fmt(Number(stats.revenue)), sub: "Từ đơn đã giao", color: "var(--green)" },
    { label: "Khách hàng", value: stats.customers, sub: "Tài khoản không phải staff", color: "var(--orange)" },
    { label: "Sản phẩm", value: stats.products, sub: "Đang quản lý trong CMS", color: "#7b5ea7" },
  ];

  return (
    <>
      <h2 style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 22 }}>Tổng quan</h2>
      <p style={{ margin: "0 0 22px", color: "var(--text-muted)", fontSize: 14 }}>Chào mừng quay lại. Đây là tình hình hiện tại của hệ thống.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: card.color, lineHeight: 1.1, margin: "6px 0 4px" }}>{card.value}</div>
            <div style={{ fontSize: 12, color: "var(--green-dark)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="adm-2col">
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Đơn hàng gần đây</h3>
          {stats.recent_orders.map((order) => (
            <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 12 }}>
              <div><div style={{ fontWeight: 700, fontSize: 13 }}>#{order.order_number}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.receiver_name} · {new Date(order.created_at).toLocaleDateString("vi-VN")}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, color: "var(--blue)", fontSize: 13 }}>{fmt(Number(order.total))}</div><AdminStatusPill status={order.status} /></div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Đơn theo trạng thái</h3>
          <AdminTable
            cols={[
              { key: "status", label: "Trạng thái", render: (row) => <span style={{ fontWeight: 800 }}>{statusLabel[row.status]}</span> },
              { key: "count", label: "Số đơn" },
              { key: "bar", label: "Tỷ lệ", render: (row) => <div style={{ height: 8, background: "#eef2ea", borderRadius: 8, overflow: "hidden" }}><div style={{ width: `${Math.max(8, Math.round((row.count / Math.max(1, stats.orders)) * 100))}%`, height: "100%", background: "var(--green)" }} /></div> },
            ]}
            rows={Object.entries(stats.orders_by_status).map(([status, count]) => ({ id: status, status: status as keyof typeof statusLabel, count: count || 0 }))}
          />
        </div>
      </div>
    </>
  );
}
