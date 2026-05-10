"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { AdminOrder, AdminOrderStatus, AdminStatusPill, AdminTable, adminButton, adminOutline, statusLabel } from "../AdminShell";

const statuses: AdminOrderStatus[] = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const statusOptions: Array<{ value: "" | AdminOrderStatus; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

async function fetchOrders(status: string, search: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search.trim()) params.set("search", search.trim());
  const response = await api.get<{ results: AdminOrder[] } | AdminOrder[]>(`/admin/orders/?${params.toString()}`);
  return Array.isArray(response.data) ? response.data : response.data.results;
}

async function updateStatus({ orderNumber, status }: { orderNumber: string; status: AdminOrderStatus }) {
  const response = await api.patch<AdminOrder>(`/admin/orders/${orderNumber}/status/`, { status });
  return response.data;
}

async function exportOrders() {
  const response = await api.get("/admin/orders/export/", { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "orders.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function paymentLabel(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === "cod") return "COD";
  if (normalized === "vnpay") return "VNPay";
  if (normalized === "momo") return "MoMo";
  return value.toUpperCase();
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders", status, search], queryFn: () => fetchOrders(status, search), retry: false });

  const statusMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder((order) => order?.order_number === updated.order_number ? updated : order);
    },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div><h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý đơn hàng</h2></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, tên, SĐT..." style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "var(--font)", minWidth: 240 }} />
          <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font)" }}>
            {statusOptions.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}
          </select>
          <button type="button" onClick={exportOrders} style={adminButton("var(--green)")}>Xuất Excel</button>
        </div>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải đơn hàng...</div> : (
        <AdminTable
          cols={[
            { key: "order_number", label: "Mã ĐH", render: (row) => <button type="button" onClick={() => setSelectedOrder(row)} style={{ border: "none", background: "transparent", color: "var(--blue)", fontWeight: 900, cursor: "pointer", padding: 0, fontFamily: "var(--font)" }}>#{row.order_number}</button> },
            { key: "customer", label: "Khách hàng", render: (row) => <div><strong>{row.receiver_name}</strong><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{row.receiver_phone}</div></div> },
            { key: "created_at", label: "Ngày đặt", render: (row) => formatDate(row.created_at) },
            { key: "payment_method", label: "Thanh toán", render: (row) => paymentLabel(row.payment_method) },
            { key: "total", label: "Tổng tiền", render: (row) => <strong>{fmt(Number(row.total))}</strong> },
            { key: "status", label: "Trạng thái", render: (row) => <AdminStatusPill status={row.status} /> },
            { key: "action", label: "Cập nhật", render: (row) => <select value={row.status} onChange={(event) => statusMutation.mutate({ orderNumber: row.order_number, status: event.target.value as AdminOrderStatus })} style={{ ...adminOutline(), padding: "6px 8px" }}>{statuses.map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}</select> },
          ]}
          rows={orders}
        />
      )}

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(nextStatus) => statusMutation.mutate({ orderNumber: selectedOrder.order_number, status: nextStatus })}
          updating={statusMutation.isPending}
        />
      )}
    </>
  );
}

function OrderDetailPanel({ order, onClose, onStatusChange, updating }: { order: AdminOrder; onClose: () => void; onStatusChange: (status: AdminOrderStatus) => void; updating: boolean }) {
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <aside onClick={(event) => event.stopPropagation()} style={{ width: "min(560px, 100vw)", height: "100vh", background: "#fff", boxShadow: "-18px 0 60px rgba(0,0,0,0.18)", padding: 22, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900 }}>#{order.order_number}</h3>
            <AdminStatusPill status={order.status} />
          </div>
          <button type="button" onClick={onClose} style={adminOutline()}>Đóng</button>
        </div>

        <section style={{ display: "grid", gap: 16 }}>
          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "#f8faf5" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 900 }}>Thông tin người nhận</h4>
            <Info label="Tên" value={order.receiver_name} />
            <Info label="SĐT" value={order.receiver_phone} />
            <Info label="Địa chỉ" value={order.receiver_address} />
            <Info label="Thanh toán" value={`${paymentLabel(order.payment_method)} / ${order.payment_status}`} />
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, fontSize: 14, fontWeight: 900, background: "#f8faf5", borderBottom: "1px solid var(--border)" }}>Sản phẩm trong đơn</div>
            <div style={{ display: "grid" }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: 12, borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>SL: {item.quantity} x {fmt(Number(item.product_price))}</div>
                  </div>
                  <strong>{fmt(Number(item.subtotal))}</strong>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, display: "grid", gap: 6, background: "#fff" }}>
              <Money label="Tạm tính" value={order.subtotal} />
              <Money label="Phí ship" value={order.shipping_fee} />
              <Money label="Tổng cộng" value={order.total} strong />
            </div>
          </div>

          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 900 }}>Ghi chú đơn hàng</h4>
            <div style={{ color: order.note ? "var(--text)" : "var(--text-muted)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{order.note || "Không có ghi chú."}</div>
          </div>

          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 900 }}>Lịch sử trạng thái</h4>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-muted)", fontSize: 13 }}>
                <span>Tạo đơn</span>
                <strong>{formatDate(order.created_at)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-muted)", fontSize: 13 }}>
                <span>Cập nhật gần nhất: {statusLabel[order.status]}</span>
                <strong>{formatDate(order.updated_at)}</strong>
              </div>
            </div>
          </div>

          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 900 }}>Cập nhật trạng thái</h4>
            <select disabled={updating} value={order.status} onChange={(event) => onStatusChange(event.target.value as AdminOrderStatus)} style={{ ...adminOutline(), width: "100%", justifyContent: "space-between" }}>
              {statuses.map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}
            </select>
          </div>
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, marginBottom: 7, fontSize: 13 }}>
      <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>{label}</span>
      <span style={{ fontWeight: 700, wordBreak: "break-word" }}>{value || "-"}</span>
    </div>
  );
}

function Money({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: strong ? 15 : 13, fontWeight: strong ? 900 : 700 }}>
      <span>{label}</span>
      <span>{fmt(Number(value))}</span>
    </div>
  );
}
