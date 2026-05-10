"use client";

import { useEffect, useRef, useState } from "react";

const QUICK_REPLIES = [
  "Tư vấn sản phẩm",
  "Theo dõi đơn hàng",
  "Bảng giá đại lý",
  "Liên hệ kỹ thuật",
];

interface Msg {
  id: number;
  from: "agent" | "user";
  text: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(2);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "agent", text: "Xin chào! Mình là Mai – chuyên viên tư vấn của Được Mùa. Mình có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function openChat() {
    setOpen(true);
    setUnread(0);
  }

  async function sendMsg(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), from: "user", text: text.trim() };
    setMsgs((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      await fetch(`${apiBase}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Khách hàng",
          email: "chat@duocmua.vn",
          message: text.trim(),
        }),
      });
      setTimeout(() => {
        setTyping(false);
        setMsgs((prev) => [...prev, {
          id: Date.now(),
          from: "agent",
          text: "Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất. Bạn có thể chat Zalo để được hỗ trợ nhanh hơn.",
        }]);
      }, 1100);
    } catch {
      setTimeout(() => {
        setTyping(false);
        setMsgs((prev) => [...prev, {
          id: Date.now(),
          from: "agent",
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng liên hệ hotline để được hỗ trợ trực tiếp.",
        }]);
      }, 1100);
    }
  }

  return (
    <>
      <style>{`
        @keyframes chatSlide {
          from { opacity:0; transform: translateY(20px) scale(0.96); }
          to   { opacity:1; transform: none; }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); }
          40%         { transform: translateY(-6px); }
        }
      `}</style>
      <button
        onClick={openChat}
        title="Chat tư vấn"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1500,
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--blue), var(--blue-dark,#0050cc))",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}
      >
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
          <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" fill="white" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            background: "#ef4444", color: "#fff", borderRadius: "50%",
            width: 20, height: 20, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 24, zIndex: 1499,
          width: "min(360px, calc(100vw - 32px))",
          height: "min(540px, calc(100vh - 130px))",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          background: "#fff",
          animation: "chatSlide .22s ease",
        }}>
          <div style={{
            background: "linear-gradient(135deg, var(--blue), var(--blue-dark,#0050cc))",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#fff", fontSize: 16,
            }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>CSKH Được Mùa</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Online</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "none", border: "none", color: "#fff",
              cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4,
            }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#f7f8fa" }}>
            {msgs.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "78%", padding: "8px 12px", borderRadius: m.from === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  background: m.from === "user" ? "var(--blue)" : "#fff",
                  color: m.from === "user" ? "#fff" : "#333",
                  fontSize: 13.5, lineHeight: 1.5,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 5, padding: "8px 12px", background: "#fff", borderRadius: "14px 14px 14px 2px", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", display: "block", animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", flexWrap: "wrap", borderTop: "1px solid #eee", background: "#fff" }}>
            {QUICK_REPLIES.map((q) => (
              <button key={q} onClick={() => sendMsg(q)} style={{
                border: "1px solid var(--blue)", borderRadius: 20, padding: "4px 10px",
                background: "none", color: "var(--blue)", fontSize: 12, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>{q}</button>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #eee", background: "#fff" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg(input)}
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1, border: "none", outline: "none", padding: "12px 14px", fontSize: 14 }}
            />
            <button onClick={() => sendMsg(input)} style={{
              background: "var(--blue)", border: "none", color: "#fff",
              padding: "0 16px", cursor: "pointer", fontSize: 20,
            }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
