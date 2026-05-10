"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { GoogleAuthProvider, User, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import { IC, dmBtn, dmInput } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/lib/store";

function firebaseMessage(error: unknown, t: ReturnType<typeof useTranslations>) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  const messages: Record<string, string> = {
    "auth/invalid-email": t("auth.error_invalid_email"),
    "auth/user-not-found": t("auth.error_user_not_found"),
    "auth/wrong-password": t("auth.error_wrong_password"),
    "auth/invalid-credential": t("auth.error_invalid_credential"),
    "auth/too-many-requests": t("auth.error_too_many_requests"),
    "auth/popup-closed-by-user": t("auth.error_popup_closed"),
    "auth/account-exists-with-different-credential": t("auth.error_account_exists"),
  };
  return messages[code] || t("common.error");
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoginContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const next = searchParams.get("next") || "/";

  const redirectAfterLogin = async (firebaseUser: User) => {
    setCheckingRole(true);
    const token = await firebaseUser.getIdToken();

    try {
      await api.get("/admin/stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.replace("/quan-tri/dashboard");
    } catch {
      router.replace(next);
    }
  };

  useEffect(() => {
    if (user && !loading && !checkingRole) {
      redirectAfterLogin(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr("");
    if (!email || !password) { setErr(t("common.error")); return; }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await redirectAfterLogin(credential.user);
    } catch (error) {
      setErr(firebaseMessage(error, t));
      setCheckingRole(false);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await redirectAfterLogin(credential.user);
    } catch (error) {
      setErr(firebaseMessage(error, t));
      setCheckingRole(false);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRole) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", padding: "100px 20px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 34, width: "100%", maxWidth: 360, boxShadow: "0 24px 64px rgba(30,91,170,0.14)", textAlign: "center" }}>
          <svg width="34" height="34" viewBox="0 0 34 34" style={{ marginBottom: 14 }}>
            <circle cx="17" cy="17" r="14" stroke="var(--border)" strokeWidth="4" fill="none" />
            <path d="M31 17a14 14 0 0 1-14 14" stroke="var(--green)" strokeWidth="4" fill="none" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 17 17" to="360 17 17" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", padding: "100px 20px 40px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 38, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(30,91,170,0.14)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" style={{ width: 68, height: 68, objectFit: "contain" }} alt="" />
          <h2 style={{ margin: "12px 0 4px", fontWeight: 800, fontSize: 22, color: "var(--text)" }}>{t("auth.login")}</h2>
        </div>
        <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <Link href="/dang-nhap" style={{ flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 14, background: "#fff", color: "var(--blue)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center", textDecoration: "none" }}>{t("auth.login")}</Link>
          <Link href="/dang-ky" style={{ flex: 1, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 14, color: "var(--text-muted)", textAlign: "center", textDecoration: "none" }}>{t("auth.register")}</Link>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("auth.email")} *</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={dmInput} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{t("auth.password")} *</label>
              <span style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600 }}>{t("auth.forgot_password")}</span>
            </div>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} style={{ ...dmInput, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass((value) => !value)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-muted)" }}><IC.Eye /></button>
            </div>
          </div>
          {err && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 14, fontWeight: 600, padding: "8px 12px", background: "#fce8ea", borderRadius: 8 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ ...dmBtn("var(--blue)"), width: "100%", justifyContent: "center", padding: 14, fontSize: 16, borderRadius: 12, opacity: loading ? 0.75 : 1 }}>{loading ? t("common.loading") : t("auth.login")}</button>
        </form>
        <button type="button" onClick={googleLogin} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font)", width: "100%", marginTop: 16 }}>
          <GoogleIcon /> {t("auth.login_google")}
        </button>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {t("auth.no_account")} <Link href="/dang-ky" style={{ color: "var(--blue)", fontWeight: 700, textDecoration: "none" }}>{t("auth.register")}</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations();
  return (
    <Suspense fallback={<div style={{ padding: "120px 0", textAlign: "center", color: "var(--text-muted)" }}>{t("common.loading")}</div>}>
      <LoginContent />
    </Suspense>
  );
}
