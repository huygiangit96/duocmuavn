"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import api from "@/lib/api";
import { AdminTable, adminButton, adminOutline } from "../AdminShell";

type ReviewStatus = "pending" | "approved" | "rejected";
type ReviewFilter = "all" | ReviewStatus;

interface ProductReview {
  id: number;
  product: number;
  product_name: string;
  user: number;
  user_email: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  created_at: string;
}

const filters: Array<{ value: ReviewFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font)",
  fontSize: 13,
  outline: "none",
} as const;

const getResults = <T,>(data: T[] | { results: T[] }) => Array.isArray(data) ? data : data.results;

async function fetchReviews() {
  const response = await api.get<ProductReview[] | { results: ProductReview[] }>("/admin/reviews/");
  return getResults(response.data);
}

async function approveReview(id: number) {
  const response = await api.patch<ProductReview>(`/admin/reviews/${id}/approve/`);
  return response.data;
}

async function rejectReview(id: number) {
  const response = await api.patch<ProductReview>(`/admin/reviews/${id}/reject/`);
  return response.data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function statusBadge(status: ReviewStatus) {
  const config = {
    pending: { label: "Chờ duyệt", bg: "#fff4df", color: "var(--orange)" },
    approved: { label: "Đã duyệt", bg: "#f0f7e0", color: "var(--green-dark)" },
    rejected: { label: "Từ chối", bg: "#fce8ea", color: "#c0392b" },
  }[status];

  return <span style={{ background: config.bg, color: config.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>{config.label}</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} sao`} style={{ whiteSpace: "nowrap", fontSize: 15, letterSpacing: 0 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} style={{ color: index < rating ? "#f4b400" : "#cfd6d1" }}>{index < rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ReviewFilter>("all");
  const [search, setSearch] = useState("");
  const { data: reviews = [], isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: fetchReviews, retry: false });

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus = status === "all" || review.status === status;
      const matchesSearch = !keyword
        || review.product_name.toLowerCase().includes(keyword)
        || review.text.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [reviews, search, status]);

  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Quản lý đánh giá</h2>
        <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Tổng: {filteredReviews.length}</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo sản phẩm hoặc nội dung..." style={{ ...inputStyle, minWidth: 280 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filters.map((item) => (
            <button key={item.value} type="button" onClick={() => setStatus(item.value)} style={{ ...adminOutline(status === item.value ? "var(--green)" : "var(--border)"), background: status === item.value ? "#f0f7e0" : "#fff", color: status === item.value ? "var(--green-dark)" : "var(--text-muted)" }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <div style={{ color: "var(--text-muted)" }}>Đang tải đánh giá...</div> : (
        <AdminTable
          cols={[
            { key: "product_name", label: "Sản phẩm", render: (row) => <strong>{row.product_name}</strong> },
            { key: "user_email", label: "Người dùng" },
            { key: "rating", label: "Sao", render: (row) => <Stars rating={row.rating} /> },
            { key: "text", label: "Nội dung", render: (row) => <span style={{ display: "block", maxWidth: 320, lineHeight: 1.5 }}>{row.text}</span> },
            { key: "created_at", label: "Ngày gửi", render: (row) => formatDate(row.created_at) },
            { key: "status", label: "Trạng thái", render: (row) => statusBadge(row.status) },
            {
              key: "actions",
              label: "Thao tác",
              render: (row) => (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(row.status === "pending" || row.status === "rejected") && (
                    <button type="button" onClick={() => approveMutation.mutate(row.id)} disabled={approveMutation.isPending || rejectMutation.isPending} style={adminButton("var(--green)")}>Duyệt</button>
                  )}
                  {(row.status === "pending" || row.status === "approved") && (
                    <button type="button" onClick={() => rejectMutation.mutate(row.id)} disabled={approveMutation.isPending || rejectMutation.isPending} style={adminOutline("#c0392b")}>Từ chối</button>
                  )}
                </div>
              ),
            },
          ]}
          rows={filteredReviews}
        />
      )}
    </>
  );
}
