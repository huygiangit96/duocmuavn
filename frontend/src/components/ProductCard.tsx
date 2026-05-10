"use client";

import { useTranslations } from "next-intl";
import { MouseEvent, useState } from "react";

import { IC } from "@/components/icons";
import { Stars } from "@/components/Stars";
import { useRouter } from "@/i18n/navigation";
import { useCartStore, useToastStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import type { Product } from "@/types";

function productPrice(product: Product) {
  return Number(product.sale_price ?? product.price ?? 0);
}

function listPrice(product: Product) {
  return Number(product.price ?? 0);
}

function productRating(product: Product) {
  return "rating" in product && typeof product.rating === "number" ? product.rating : 5;
}

function productReviews(product: Product) {
  return "reviews" in product && typeof product.reviews === "number"
    ? product.reviews
    : product.sale_count ?? 0;
}

function productUnit(product: Product) {
  const specs = product.specs;
  if (specs && typeof specs === "object") {
    const unit = specs.unit || specs.quy_cach || specs["Quy cách"];
    if (typeof unit === "string" || typeof unit === "number") {
      return String(unit);
    }
  }
  return "Liên hệ";
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

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const [hov, setHov] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const price = productPrice(product);
  const originalPrice = listPrice(product);

  const onAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addItem(product);
    showToast(t("cart.added"));
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => router.push(`/san-pham/${product.slug}`)}
      style={{ background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer", border: "1.5px solid", borderColor: hov ? "var(--green)" : "var(--border)", boxShadow: hov ? "0 10px 36px rgba(30,91,170,0.13)" : "var(--shadow)", transform: hov ? "translateY(-5px)" : "none", transition: "all 0.25s ease", position: "relative", display: "flex", flexDirection: "column" }}
    >
      {product.tag && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
          <span style={{ background: product.tag === "Mới" ? "var(--green)" : "var(--orange)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5 }}>{product.tag}</span>
          {product.sale_price && <span style={{ background: "#c0392b", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 5, boxShadow: "0 2px 6px rgba(192,57,43,0.35)" }}>KM</span>}
        </div>
      )}
      <ProductImg product={product} height={170} />
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{product.category?.name}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6, lineHeight: 1.4, minHeight: 40 }}>{product.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Stars rating={productRating(product)} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({productReviews(product)})</span>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--blue)", lineHeight: 1.1 }}>{fmt(price)}</div>
            {product.sale_price && originalPrice > price && (
              <div style={{ fontSize: 12, color: "#999", textDecoration: "line-through", marginTop: 1 }}>{fmt(originalPrice)}</div>
            )}
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{productUnit(product)}</div>
          </div>
          <button
            type="button"
            onClick={onAdd}
            style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "var(--font)", transition: "background 0.2s", width: "100%" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--green-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--green)"}
          >
            <IC.Plus /> {t("product.add_to_cart")}
          </button>
        </div>
      </div>
    </div>
  );
}
