"use client";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

const buttonStyle = (active: boolean) => ({
  background: active ? "var(--green)" : "transparent",
  color: active ? "#fff" : "var(--text-muted)",
  border: active ? "1px solid var(--green)" : "1px solid var(--border)",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: active ? 700 : 600,
  cursor: "pointer",
  lineHeight: 1.2,
  fontFamily: "var(--font)",
});

export function LangSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: "vi" | "en") => {
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <button
        type="button"
        onClick={() => switchLocale("vi")}
        style={buttonStyle(locale === "vi")}
      >
        VI
      </button>
      <span
        aria-hidden="true"
        style={{ width: 1, height: 16, background: "var(--border)", display: "block" }}
      />
      <button
        type="button"
        onClick={() => switchLocale("en")}
        style={buttonStyle(locale === "en")}
      >
        EN
      </button>
    </div>
  );
}
