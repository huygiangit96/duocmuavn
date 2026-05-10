"use client";

import { useTranslations } from "next-intl";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const t = useTranslations();

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) =>
      item === 1 ||
      item === totalPages ||
      Math.abs(item - page) <= 2,
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{ border: "1.5px solid var(--border)", background: page <= 1 ? "#f4f7f0" : "#fff", color: page <= 1 ? "#a8b39f" : "var(--text)", borderRadius: 9, padding: "8px 12px", cursor: page <= 1 ? "not-allowed" : "pointer", fontFamily: "var(--font)", fontWeight: 700 }}
      >
        {t("common.prev")}
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const showGap = previous && item - previous > 1;
        return (
          <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {showGap && <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>...</span>}
            <button
              type="button"
              aria-label={`${t("common.page")} ${item}`}
              onClick={() => onPageChange(item)}
              style={{ width: 36, height: 36, borderRadius: 9, border: "1.5px solid", borderColor: page === item ? "var(--blue)" : "var(--border)", background: page === item ? "var(--blue)" : "#fff", color: page === item ? "#fff" : "var(--text)", cursor: "pointer", fontFamily: "var(--font)", fontWeight: 800 }}
            >
              {item}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{ border: "1.5px solid var(--border)", background: page >= totalPages ? "#f4f7f0" : "#fff", color: page >= totalPages ? "#a8b39f" : "var(--text)", borderRadius: 9, padding: "8px 12px", cursor: page >= totalPages ? "not-allowed" : "pointer", fontFamily: "var(--font)", fontWeight: 700 }}
      >
        {t("common.next")}
      </button>
    </div>
  );
}
