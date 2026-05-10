"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

interface ContactSubmission {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  created_at: string;
  is_read?: boolean;
}

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font)",
  fontSize: 13,
  outline: "none",
} as const;

const getResults = <T,>(data: T[] | { results: T[] }) => Array.isArray(data) ? data : data.results;

async function fetchContacts() {
  const response = await api.get<ContactSubmission[] | { results: ContactSubmission[] }>("/admin/contacts/");
  return getResults(response.data).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function toggleRead(contact: ContactSubmission) {
  const response = await api.patch<ContactSubmission>(`/admin/contacts/${contact.id}/`, { is_read: !contact.is_read });
  return response.data;
}

function truncate(value: string, length = 80) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function statusBadge(isRead?: boolean) {
  return (
    <span style={{ background: isRead ? "#f0f7e0" : "#fff4df", color: isRead ? "var(--green-dark)" : "var(--orange)", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>
      {isRead ? "Đã đọc" : "Chưa xử lý"}
    </span>
  );
}

export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const { data: contacts = [], isLoading } = useQuery({ queryKey: ["admin-contacts"], queryFn: fetchContacts, retry: false });

  const filteredContacts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return contacts;
    return contacts.filter((contact) => {
      return (contact.email || "").toLowerCase().includes(keyword)
        || contact.message.toLowerCase().includes(keyword)
        || contact.name.toLowerCase().includes(keyword)
        || contact.phone.toLowerCase().includes(keyword);
    });
  }, [contacts, search]);

  const toggleMutation = useMutation({
    mutationFn: toggleRead,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setSelectedContact(updated);
    },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý liên hệ</h2>
        <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Tổng: {filteredContacts.length}</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo email hoặc nội dung..." style={{ ...inputStyle, minWidth: 280 }} />
        <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700 }}>Sắp xếp: mới nhất trước</span>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải liên hệ...</div> : (
        <AdminTable
          cols={[
            { key: "name", label: "Họ tên", render: (row) => <strong>{row.name}</strong> },
            { key: "email", label: "Email", render: (row) => row.email || "-" },
            { key: "phone", label: "Số điện thoại" },
            { key: "message", label: "Nội dung", render: (row) => <span style={{ display: "block", maxWidth: 340, lineHeight: 1.5 }}>{truncate(row.message)}</span> },
            { key: "created_at", label: "Ngày gửi", render: (row) => formatDate(row.created_at) },
            { key: "is_read", label: "Trạng thái", render: (row) => statusBadge(row.is_read) },
          ]}
          rows={filteredContacts}
          onRowClick={setSelectedContact}
        />
      )}

      {selectedContact && (
        <div role="dialog" aria-modal="true" onClick={() => setSelectedContact(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
          <aside onClick={(event) => event.stopPropagation()} style={{ width: "min(460px, 100vw)", height: "100vh", background: "#fff", boxShadow: "-18px 0 60px rgba(0,0,0,0.18)", padding: 22, overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900 }}>{selectedContact.name}</h3>
                {statusBadge(selectedContact.is_read)}
              </div>
              <button type="button" onClick={() => setSelectedContact(null)} style={adminOutline()}>Đóng</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <Info label="Email" value={selectedContact.email || "-"} />
              <Info label="Số điện thoại" value={selectedContact.phone || "-"} />
              <Info label="Ngày gửi" value={formatDate(selectedContact.created_at)} />
              <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "#f8faf5" }}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>Nội dung đầy đủ</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{selectedContact.message}</div>
              </div>

              {"is_read" in selectedContact && (
                <button type="button" onClick={() => toggleMutation.mutate(selectedContact)} disabled={toggleMutation.isPending} style={adminButton(selectedContact.is_read ? "var(--orange)" : "var(--green)")}>
                  {selectedContact.is_read ? "Chưa xử lý" : "Đánh dấu đã xử lý"}
                </button>
              )}
            </div>
          </aside>
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
