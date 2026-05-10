"use client";

import { useTranslations } from "next-intl";
import { signOut } from "firebase/auth";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { IC, dmBtn, dmIcon, dmInput } from "@/components/icons";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { auth } from "@/lib/firebase";
import { useCartStore, useUserStore } from "@/lib/store";

interface HeaderProps {
  onCartOpen: () => void;
}

const nav = [
  ["home", "nav.home", "/"],
  ["products", "nav.products", "/san-pham"],
  ["news", "nav.news", "/tin-tuc"],
  ["docs", "nav.docs", "/tai-lieu"],
  ["contact", "nav.contact", "/lien-he"],
] as const;

const pageFromPath = (pathname: string) => {
  if (pathname.startsWith("/san-pham")) return "products";
  if (pathname.startsWith("/tin-tuc")) return "news";
  if (pathname.startsWith("/tai-lieu")) return "docs";
  if (pathname.startsWith("/lien-he")) return "contact";
  if (pathname.startsWith("/tai-khoan")) return "account";
  if (pathname.startsWith("/dang-nhap")) return "login";
  return "home";
};

export function Header({ onCartOpen }: HeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const page = pageFromPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [srchOpen, setSrchOpen] = useState(false);
  const [srchQ, setSrchQ] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cart = useCartStore((state) => state.items);
  const user = useUserStore((state) => state.user);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const userLastName = (user?.displayName || user?.email || "")
    .split(" ")
    .filter(Boolean)
    .pop();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const runSearch = () => {
    const q = srchQ.trim();
    router.push(q ? `/san-pham?search=${encodeURIComponent(q)}` : "/san-pham");
    setSrchOpen(false);
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      runSearch();
    }
  };

  const openAccount = () => {
    if (accountTimer.current) clearTimeout(accountTimer.current);
    setAccountOpen(true);
  };

  const closeAccount = () => {
    accountTimer.current = setTimeout(() => setAccountOpen(false), 120);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAccountOpen(false);
    router.push("/dang-nhap");
  };

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(255,255,255,0.97)" : "#fff", borderBottom: "1px solid var(--border)", boxShadow: scrolled ? "0 4px 24px rgba(30,91,170,0.09)" : "none", backdropFilter: "blur(12px)", transition: "box-shadow 0.3s" }}>
      <div style={{ background: "var(--blue)", padding: "5px 0", fontSize: 12, color: "rgba(255,255,255,0.9)", backgroundColor: "rgb(30, 107, 170)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>{t("header.hotline")}: <strong style={{ color: "#FFE600" }}>1800 xxxx</strong> &nbsp;|&nbsp; Zalo: <strong style={{ color: "#FFE600" }}>0909 xxx xxx</strong></span>
          <span className="hide-xs">{t("header.slogan")}</span>
        </div>
      </div>

      <div className="container" style={{ display: "flex", alignItems: "center", padding: "10px 20px", gap: 16 }}>
        <Link href="/" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" style={{ width: 50, height: 50, objectFit: "contain" }} alt="Được Mùa GAH" />
          <div className="hide-xs">
            <div style={{ fontWeight: 800, fontSize: 17, color: "var(--blue)", lineHeight: 1.1 }}>Được Mùa GAH</div>
            <div style={{ fontSize: 11, color: "var(--green-dark)", fontWeight: 600, letterSpacing: 1.5 }}>NÔNG NGHIỆP VIỆT</div>
          </div>
        </Link>

        <nav className="desk-nav" style={{ display: "flex", flex: 1, justifyContent: "center", gap: 2 }}>
          {nav.map(([k, labelKey, href]) => (
            <Link key={k} href={href} style={{ background: page === k ? "#e8f4e0" : "none", border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 9, fontSize: 14, fontWeight: page === k ? 700 : 500, color: page === k ? "var(--green-dark)" : "var(--text)", transition: "all 0.2s", fontFamily: "var(--font)", textDecoration: "none" }}>{t(labelKey)}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <button type="button" onClick={() => setSrchOpen((v) => !v)} style={dmIcon} aria-label={t("common.search")}><IC.Search /></button>
          <button type="button" onClick={onCartOpen} style={dmIcon} aria-label={t("header.cart")}><IC.Cart count={cartCount} /></button>
          {user ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={openAccount}
              onMouseLeave={closeAccount}
            >
              <div
                style={{ ...dmIcon, background: "#e8f4e0", borderRadius: 20, padding: "6px 12px", gap: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
                aria-label={t("header.account")}
              >
                <IC.User />
                <span className="hide-xs" style={{ fontSize: 13, fontWeight: 700, color: "var(--green-dark)" }}>
                  {userLastName}
                </span>
              </div>

              {accountOpen && (
                <div
                  onMouseEnter={openAccount}
                  onMouseLeave={closeAccount}
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    background: "#fff", borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(30,91,170,0.14)",
                    border: "1px solid var(--border)",
                    minWidth: 160, zIndex: 1200,
                    overflow: "hidden",
                    animation: "fadeDown 0.15s ease",
                  }}
                >
                  <style>{`
                    @keyframes fadeDown {
                      from { opacity: 0; transform: translateY(-6px); }
                      to   { opacity: 1; transform: none; }
                    }
                  `}</style>
                  {[
                    { label: "Hồ sơ", icon: "👤", href: "/tai-khoan" },
                    { label: "Đơn hàng", icon: "📦", href: "/tai-khoan/don-hang" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAccountOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 14, fontWeight: 600, color: "#e53e3e", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "var(--font)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 16 }}>🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              style={{ ...dmIcon, background: "none", borderRadius: 20, padding: "6px 12px", gap: 6, textDecoration: "none" }}
              aria-label={t("auth.login")}
            >
              <IC.User />
              <span className="hide-xs" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
                {t("auth.login")}
              </span>
            </Link>
          )}
          <LangSwitcher />
          <button type="button" className="mob-nav-btn" onClick={() => setMobileOpen((v) => !v)} style={{ ...dmIcon, display: "none" }}><IC.Menu /></button>
        </div>
      </div>

      {srchOpen && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", background: "#f8faf5" }}>
          <div className="container">
            <div style={{ display: "flex", gap: 8, maxWidth: 600, margin: "0 auto" }}>
              <input autoFocus value={srchQ} onChange={(e) => setSrchQ(e.target.value)} onKeyDown={onSearchKeyDown} placeholder={t("header.search_placeholder")} style={{ ...dmInput, flex: 1 }} />
              <button type="button" onClick={runSearch} style={dmBtn("var(--blue)")}>{t("common.search")}</button>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div style={{ borderTop: "1px solid var(--border)", background: "#fff", padding: "8px 20px 16px" }}>
          {nav.map(([k, labelKey, href]) => (
            <Link key={k} href={href} onClick={() => setMobileOpen(false)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "13px 8px", fontSize: 15, fontWeight: page === k ? 700 : 400, color: page === k ? "var(--green-dark)" : "var(--text)", cursor: "pointer", borderBottom: "1px solid var(--border)", fontFamily: "var(--font)", textDecoration: "none" }}>{t(labelKey)}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
