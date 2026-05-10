"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import ChatWidget from "@/components/ChatWidget";
import { IC } from "@/components/icons";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Toast } from "@/components/Toast";

function AuthListener() {
  useAuth();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/quan-tri");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const [config, setConfig] = useState<{ hotline?: string; zalo_url?: string }>({});
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/config/`)
      .then((response) => response.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, [apiBase]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      {!isAdmin && <Header onCartOpen={() => setCartOpen(true)} />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
      <Toast />
      {!isAdmin && (
        <>
          <div style={{ position: "fixed", bottom: 28, left: 24, zIndex: 900, display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={`tel:${config.hotline || "19009999"}`} title="Gọi hotline" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(30,91,170,0.35)", textDecoration: "none" }}>
              <IC.Phone />
            </a>
            <a href={config.zalo_url || "#"} title="Chat Zalo" style={{ width: 48, height: 48, borderRadius: "50%", background: "#0068ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,104,255,0.35)", textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="#fff"><path d="M16 3C8.8 3 3 8.1 3 14.4c0 4 2.2 7.6 5.6 9.9l-.9 4.3 4.7-2.4c1.1.3 2.3.5 3.6.5 7.2 0 13-5.1 13-11.4C29 8.1 23.2 3 16 3zm1.3 15.3l-3.3-3.5-6.4 3.5 7.1-7.5 3.4 3.5 6.3-3.5-7.1 7.5z"/></svg>
            </a>
          </div>
          <ChatWidget />
        </>
      )}
    </QueryClientProvider>
  );
}
