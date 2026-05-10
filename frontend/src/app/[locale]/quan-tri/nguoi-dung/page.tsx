"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import api from "@/lib/api";
import { fmt } from "@/lib/utils";
import { AdminOrder, AdminTable, adminButton, adminOutline } from "../AdminShell";

type UserFilter = "all" | "active" | "inactive" | "staff";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  firebase_uid?: string;
  order_count?: number;
  recent_orders?: AdminOrder[];
}

interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

const filterOptions: Array<{ value: UserFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Bị khóa" },
  { value: "staff", label: "Staff" },
];

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font)",
  fontSize: 13,
  outline: "none",
} as const;

function getResults(data: AdminUser[] | PaginatedUsers) {
  return Array.isArray(data) ? data : data.results;
}

function getCount(data: AdminUser[] | PaginatedUsers | undefined, fallback: number) {
  if (!data || Array.isArray(data)) return fallback;
  return data.count;
}

function fullName(user: AdminUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || user.username;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

async function fetchUsers(search: string, page: number) {
  const params = new URLSearchParams({ page_size: "20", page: String(page) });
  if (search.trim()) params.set("search", search.trim());
  const response = await api.get<AdminUser[] | PaginatedUsers>(`/admin/users/?${params.toString()}`);
  return response.data;
}

async function toggleActive(id: number) {
  const response = await api.patch<AdminUser>(`/admin/users/${id}/toggle-active/`);
  return response.data;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["admin-users", search, page], queryFn: () => fetchUsers(search, page), retry: false });
  const users = useMemo(() => getResults(data || []), [data]);
  const filteredUsers = useMemo(() => users.filter((user) => {
    if (filter === "active") return user.is_active;
    if (filter === "inactive") return !user.is_active;
    if (filter === "staff") return user.is_staff;
    return true;
  }), [filter, users]);
  const total = getCount(data, users.length);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const toggleMutation = useMutation({
    mutationFn: toggleActive,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const snapshots = queryClient.getQueriesData<AdminUser[] | PaginatedUsers>({ queryKey: ["admin-users"] });
      snapshots.forEach(([key, value]) => {
        if (!value) return;
        if (Array.isArray(value)) {
          queryClient.setQueryData(key, value.map((user) => user.id === id ? { ...user, is_active: !user.is_active } : user));
        } else {
          queryClient.setQueryData(key, {
            ...value,
            results: value.results.map((user) => user.id === id ? { ...user, is_active: !user.is_active } : user),
          });
        }
      });
      setSelectedUser((user) => user?.id === id ? { ...user, is_active: !user.is_active } : user);
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<AdminUser[] | PaginatedUsers>({ queryKey: ["admin-users"] }, (value) => {
        if (!value) return value;
        if (Array.isArray(value)) return value.map((user) => user.id === updated.id ? updated : user);
        return { ...value, results: value.results.map((user) => user.id === updated.id ? updated : user) };
      });
      setSelectedUser((user) => user?.id === updated.id ? updated : user);
    },
  });

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý người dùng</h2>
        <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Tổng: {total}</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Tìm theo email hoặc tên..." style={{ ...inputStyle, minWidth: 260 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterOptions.map((option) => (
            <button key={option.value} type="button" onClick={() => setFilter(option.value)} style={{ ...adminOutline(filter === option.value ? "var(--green)" : "var(--border)"), background: filter === option.value ? "#f0f7e0" : "#fff", color: filter === option.value ? "var(--green-dark)" : "var(--text-muted)" }}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải người dùng...</div> : (
        <AdminTable
          cols={[
            { key: "email", label: "Email", render: (row) => <span style={{ fontWeight: 700 }}>{row.email || "-"}</span> },
            { key: "name", label: "Họ tên", render: (row) => <button type="button" onClick={() => setSelectedUser(row)} style={{ border: "none", background: "transparent", color: "var(--blue)", fontWeight: 800, cursor: "pointer", padding: 0, fontFamily: "var(--font)" }}>{fullName(row)}</button> },
            { key: "date_joined", label: "Ngày đăng ký", render: (row) => formatDate(row.date_joined) },
            { key: "is_active", label: "Trạng thái", render: (row) => <span style={{ background: row.is_active ? "#f0f7e0" : "#fce8ea", color: row.is_active ? "var(--green-dark)" : "#c0392b", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{row.is_active ? "active" : "inactive"}</span> },
            { key: "is_staff", label: "Quyền", render: (row) => row.is_staff ? <span style={{ background: "#e8f0fb", color: "var(--blue)", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>Staff</span> : <span style={{ color: "var(--text-muted)" }}>User</span> },
            { key: "order_count", label: "Đơn hàng", render: (row) => row.order_count ?? "-" },
            { key: "actions", label: "Thao tác", render: (row) => <button type="button" onClick={() => toggleMutation.mutate(row.id)} disabled={toggleMutation.isPending} style={adminOutline(row.is_active ? "#c0392b" : "var(--green)")}>{row.is_active ? "Khóa" : "Mở khóa"}</button> },
          ]}
          rows={filteredUsers}
        />
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 14 }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} style={{ ...adminOutline(), opacity: page <= 1 ? 0.5 : 1 }}>Trước</button>
        <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Trang {page}/{totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} style={{ ...adminOutline(), opacity: page >= totalPages ? 0.5 : 1 }}>Tiếp</button>
      </div>

      {selectedUser && (
        <div role="dialog" aria-modal="true" onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(event) => event.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 720, maxHeight: "86vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{fullName(selectedUser)}</h3>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{selectedUser.email}</div>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} style={adminOutline()}>Đóng</button>
            </div>
            <div style={{ padding: 18, display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <Info label="Email" value={selectedUser.email || "-"} />
                <Info label="Tên" value={fullName(selectedUser)} />
                <Info label="Ngày tham gia" value={formatDate(selectedUser.date_joined)} />
                <Info label="Firebase UID" value={selectedUser.firebase_uid || selectedUser.username || "-"} />
              </div>
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 900 }}>5 đơn hàng gần nhất</h4>
                {selectedUser.recent_orders?.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {selectedUser.recent_orders.slice(0, 5).map((order) => (
                      <div key={order.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
                        <strong style={{ color: "var(--blue)" }}>#{order.order_number}</strong>
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{order.status}</span>
                        <span style={{ fontWeight: 900 }}>{fmt(Number(order.total))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", padding: 16, border: "1px solid var(--border)", borderRadius: 10 }}>Chưa có đơn hàng.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "#f8faf5" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{ fontWeight: 800, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
