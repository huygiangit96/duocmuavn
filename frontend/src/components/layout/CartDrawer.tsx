"use client";

import { useTranslations } from "next-intl";

import { IC, dmBtn, dmIcon, dmQty } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import type { Product } from "@/types";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function productPrice(product: Product) {
  return Number(product.sale_price ?? product.price ?? 0);
}

function ProductImg({ product, height = 180 }: { product: Product; height?: number }) {
  const image = product.images?.[0]?.image || product.thumbnail;
  const cat = product.category || { color: "#888", name: "" };
  const color = cat.color || "#888";

  if (image) {
    return (
      <div style={{ height, background: "#f0f0f0", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ height, background: "#f0f7e0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden" }}>
      <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="2" width="32" height="44" rx="4" fill={color} opacity="0.18" />
        <rect x="12" y="6" width="24" height="32" rx="3" fill={color} opacity="0.3" />
        <rect x="16" y="12" width="16" height="4" rx="2" fill={color} opacity="0.6" />
        <rect x="16" y="20" width="12" height="3" rx="1.5" fill={color} opacity="0.4" />
        <rect x="16" y="26" width="14" height="3" rx="1.5" fill={color} opacity="0.4" />
        <rect x="18" y="50" width="12" height="8" rx="2" fill={color} opacity="0.25" />
      </svg>
      <span style={{ fontSize: 11, color, opacity: 0.65, textAlign: "center", padding: "0 12px", fontFamily: "monospace", lineHeight: 1.4, maxWidth: "90%" }}>{product.name}</span>
    </div>
  );
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const t = useTranslations();
  const cart = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const total = cart.reduce((s, i) => s + productPrice(i.product) * i.quantity, 0);
  const upd = (id: number, qty: number, d: number) => updateQty(id, Math.max(0, qty + d));

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1998 }} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, maxWidth: "92vw", background: "#fff", zIndex: 1999, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column", boxShadow: "-10px 0 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--blue)" }}>{t("cart.title")} &nbsp;<span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>({cart.reduce((s, i) => s + i.quantity, 0)})</span></h3>
          <button type="button" onClick={onClose} style={dmIcon}><IC.X /></button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--text-muted)" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d0d8c8" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            <p style={{ margin: 0, fontSize: 15 }}>{t("cart.empty")}</p>
            <Link href="/san-pham" onClick={onClose} style={{ ...dmBtn("var(--green)"), textDecoration: "none" }}>{t("cart.shop_now")}</Link>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 64, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
                    <ProductImg product={item.product} height={64} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{item.product.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--blue)", marginBottom: 8 }}>{fmt(productPrice(item.product))}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button type="button" onClick={() => upd(item.product.id, item.quantity, -1)} style={dmQty}><IC.Minus /></button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button type="button" onClick={() => upd(item.product.id, item.quantity, +1)} style={dmQty}><IC.Plus /></button>
                      <button type="button" onClick={() => upd(item.product.id, item.quantity, -item.quantity)} style={{ ...dmIcon, color: "#c0392b", marginLeft: "auto", padding: 6 }}><IC.Trash /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "#fafbf8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 16 }}>
                <span style={{ fontWeight: 600 }}>{t("cart.subtotal")}</span>
                <span style={{ fontWeight: 800, color: "var(--blue)", fontSize: 20 }}>{fmt(total)}</span>
              </div>
              <Link href="/thanh-toan" onClick={onClose} style={{ ...dmBtn("var(--orange)"), width: "100%", justifyContent: "center", padding: "14px", fontSize: 15, textDecoration: "none" }}>{t("cart.checkout")}</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
