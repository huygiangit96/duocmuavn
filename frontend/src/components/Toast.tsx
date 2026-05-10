"use client";

import { IC } from "@/components/icons";
import { useToastStore } from "@/lib/store";

export function Toast() {
  const msg = useToastStore((state) => state.message);

  return msg ? (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 3000, background: "var(--green)", color: "#fff", padding: "12px 20px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, animation: "toastIn .3s ease" }}><IC.Check /> {msg}</div>
  ) : null;
}
