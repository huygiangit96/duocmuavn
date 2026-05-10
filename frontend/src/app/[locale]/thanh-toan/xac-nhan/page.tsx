"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { dmBtn, dmOutline } from "@/components/icons";
import { Link } from "@/i18n/navigation";

function ConfirmationContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const status = searchParams.get("status");
  const failed = status === "failed";
  const success = status === "success";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px 40px", gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: failed ? "#fce8ea" : "#f0f7e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {failed ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
        )}
      </div>
      <h2 style={{ fontWeight: 800, color: failed ? "#c0392b" : "var(--green)", fontSize: 26, textAlign: "center" }}>
        {failed ? t("order.payment_failed") : success ? t("order.payment_success") : t("order.success")}
      </h2>
      <p style={{ color: "var(--text-muted)", textAlign: "center", maxWidth: 420 }}>
        {failed ? t("order.payment_failed_message") : t("order.thank_you")}
      </p>
      {orderNumber && (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 800, color: "var(--blue)" }}>
          {t("order.order_code")}: {orderNumber}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/san-pham" style={{ ...dmBtn("var(--green)"), textDecoration: "none" }}>{t("order.continue_shopping")}</Link>
        <Link href="/tai-khoan" style={{ ...dmOutline(), textDecoration: "none" }}>{t("order.view_order")}</Link>
      </div>
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
