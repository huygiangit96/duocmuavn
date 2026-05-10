"use client";

import { useEffect, useState } from "react";

interface SliderBanner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  tag: string;
  bg_color: string;
}

export function BannerSlider({ banners }: { banners: SliderBanner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 22,
        borderRadius: 14,
        overflow: "hidden",
        height: 240,
      }}
    >
      {/* Render tất cả slides, dùng opacity để fade */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          onClick={() => { if (b.link) window.location.href = b.link; }}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            pointerEvents: i === current ? "auto" : "none",
            cursor: b.link ? "pointer" : "default",
          }}
        >
          {/* Nền màu */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: b.bg_color || "linear-gradient(135deg, var(--green), var(--blue))",
            }}
          />
          {/* Ảnh full nền */}
          {b.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.image}
              alt={b.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%)",
            }}
          />
          {/* Tag badge */}
          {b.tag && (
            <span
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: "var(--orange)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {b.tag}
            </span>
          )}
          {/* Text */}
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 60 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#fff",
                marginBottom: 6,
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                lineHeight: 1.3,
              }}
            >
              {b.title}
            </div>
            {b.subtitle && (
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.88)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                {b.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
      {/* Dots indicator — nằm trên tất cả slides */}
      {banners.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 16,
            display: "flex",
            gap: 6,
            zIndex: 10,
          }}
        >
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
