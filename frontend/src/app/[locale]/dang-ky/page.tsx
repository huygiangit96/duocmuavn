"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

import { IC, dmBtn, dmInput } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/lib/store";

function firebaseMessage(error: unknown, t: ReturnType<typeof useTranslations>) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  const messages: Record<string, string> = {
    "auth/invalid-email": t("auth.error_invalid_email"),
    "auth/email-already-in-use": t("auth.error_email_in_use"),
    "auth/weak-password": t("auth.error_weak_password"),
    "auth/too-many-requests": t("auth.error_too_many_requests"),
  };
  return messages[code] || t("common.error");
}

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (user && !registered) router.replace("/");
  }, [registered, router, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr("");
    if (!name || !email || !password || password.length < 6 || password !== password2) {
      setErr(t("common.error"));
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await signOut(auth);
      setRegistered(true);
      setName("");
      setEmail("");
      setPassword("");
      setPassword2("");
    } catch (error) {
      setErr(firebaseMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", padding: "100px 20px 40px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 38, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(30,91,170,0.14)" }}>
        {registered ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f7e0", color: "var(--green)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(73,160,53,0.25)" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 22, color: "var(--green-dark)" }}>{t("auth.register_success_title")}</h2>
            <p style={{ margin: "0 auto 24px", color: "var(--text-muted)", lineHeight: 1.7, fontSize: 14, maxWidth: 320 }}>{t("auth.register_success_message")}</p>
            <button type="button" onClick={() => router.push("/dang-nhap")} style={{ ...dmBtn("var(--green)"), width: "100%", justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 12 }}>{t("auth.go_to_login")}</button>
          </div>
        ) : (
          <>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" style={{ width: 68, height: 68, objectFit: "contain" }} alt="" />
          <h2 style={{ margin: "12px 0 4px", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>{t("auth.register")}</h2>
        </div>
        <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <Link href="/dang-nhap" style={{ flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 14, color: "var(--text-muted)", textAlign: "center", textDecoration: "none" }}>{t("auth.login")}</Link>
          <Link href="/dang-ky" style={{ flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 14, background: "#fff", color: "var(--blue)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center", textDecoration: "none" }}>{t("auth.register")}</Link>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("auth.full_name")} *</label>
            <input value={name} onChange={(event) => setName(event.target.value)} style={dmInput} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("auth.email")} *</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={dmInput} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("auth.password")} *</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} style={{ ...dmInput, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass((value) => !value)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-muted)" }}><IC.Eye /></button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("auth.confirm_password")} *</label>
            <input type={showPass ? "text" : "password"} value={password2} onChange={(event) => setPassword2(event.target.value)} style={dmInput} />
          </div>
          {err && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 14, fontWeight: 600, padding: "8px 12px", background: "#fce8ea", borderRadius: 8 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ ...dmBtn("var(--blue)"), width: "100%", justifyContent: "center", padding: 14, fontSize: 16, borderRadius: 12, opacity: loading ? 0.75 : 1 }}>{loading ? t("common.loading") : t("auth.register")}</button>
        </form>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {t("auth.have_account")} <Link href="/dang-nhap" style={{ color: "var(--blue)", fontWeight: 700, textDecoration: "none" }}>{t("auth.login")}</Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
