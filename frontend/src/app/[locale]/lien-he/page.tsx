"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { IC, dmBtn, dmInput } from "@/components/icons";
import api from "@/lib/api";
import type { SiteConfig } from "@/types";

const fallbackConfig: SiteConfig = {
  hotline: "1800 xxxx",
  zalo_url: "#",
  facebook_url: "#",
  address: "123 Duong Nong Nghiep, TP. Can Tho",
  email: "contact@duocmua.vn",
  google_map_embed: "",
  policy_buying: "",
  policy_shipping: "",
  tagline: "",
};

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  subject: z.string().min(2),
  message: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

async function fetchConfig() {
  const response = await api.get<Partial<SiteConfig>>("/config/");
  return { ...fallbackConfig, ...response.data };
}

async function submitContact(values: ContactForm) {
  const response = await api.post("/contact/", {
    name: values.name,
    phone: values.phone,
    email: values.email,
    message: `Subject: ${values.subject}\n\n${values.message}`,
  });
  return response.data;
}

function FieldError({ show }: { show?: boolean }) {
  const t = useTranslations();
  if (!show) return null;
  return <div style={{ marginTop: 6, color: "var(--orange)", fontSize: 12, fontWeight: 600 }}>{t("common.error")}</div>;
}

function MapBlock({ config }: { config: SiteConfig }) {
  if (config.google_map_embed) {
    return (
      <div style={{ height: 230, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }} dangerouslySetInnerHTML={{ __html: config.google_map_embed }} />
    );
  }

  return (
    <iframe
      title="OpenStreetMap Duoc Mua"
      src="https://www.openstreetmap.org/export/embed.html?bbox=105.707%2C10.016%2C105.829%2C10.091&layer=mapnik&marker=10.0452%2C105.7469"
      style={{ height: 230, width: "100%", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow)", display: "block" }}
      loading="lazy"
    />
  );
}

export default function ContactPage() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);
  const { data: config = fallbackConfig, isLoading } = useQuery({ queryKey: ["contact-config"], queryFn: fetchConfig, retry: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      reset();
      setSent(true);
    },
  });

  const contactItems = [
    { bg: "var(--blue)", color: "#fff", icon: <IC.Phone />, label: t("header.hotline"), val: config.hotline || fallbackConfig.hotline, href: `tel:${config.hotline || fallbackConfig.hotline}` },
    { bg: "#f0f7e0", color: "var(--green-dark)", icon: <IC.Pin />, label: t("order.address"), val: config.address || fallbackConfig.address, href: null },
    { bg: "#fef0e6", color: "var(--orange)", icon: <IC.Mail />, label: t("contact.email"), val: config.email || fallbackConfig.email, href: `mailto:${config.email || fallbackConfig.email}` },
  ];

  return (
    <div style={{ padding: "0 0 56px" }}>
      <div className="container">
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 5px" }}>{t("contact.title")}</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>{isLoading ? t("common.loading") : t("contact.contact_info")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="contact-grid">
          <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <h3 style={{ fontWeight: 800, color: "var(--green)", marginBottom: 8 }}>{t("contact.success")}</h3>
                <button type="button" onClick={() => setSent(false)} style={dmBtn("var(--green)")}>{t("contact.send")}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
                <h3 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 17 }}>{t("contact.send")}</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("contact.name")} *</label>
                  <input type="text" {...register("name")} style={dmInput} />
                  <FieldError show={Boolean(errors.name)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="contact-grid">
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("contact.email")} *</label>
                    <input type="email" {...register("email")} style={dmInput} />
                    <FieldError show={Boolean(errors.email)} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("contact.phone")} *</label>
                    <input type="tel" {...register("phone")} style={dmInput} />
                    <FieldError show={Boolean(errors.phone)} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("contact.subject")} *</label>
                  <input type="text" {...register("subject")} style={dmInput} />
                  <FieldError show={Boolean(errors.subject)} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("contact.message")} *</label>
                  <textarea {...register("message")} style={{ ...dmInput, height: 110, resize: "vertical" }} />
                  <FieldError show={Boolean(errors.message)} />
                </div>
                {mutation.isError && <div style={{ background: "#fef0e6", color: "var(--orange)", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{t("common.error")}</div>}
                <button type="submit" disabled={mutation.isPending} style={{ ...dmBtn("var(--green)"), width: "100%", justifyContent: "center", padding: 14, fontSize: 15, opacity: mutation.isPending ? 0.75 : 1 }}>
                  {mutation.isPending ? t("common.loading") : t("contact.send")}
                </button>
              </form>
            )}
          </div>

          <div>
            <h3 style={{ margin: "0 0 16px", fontWeight: 800 }}>{t("contact.contact_info")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 22 }}>
              {contactItems.map((item) => (
                <a key={item.label} href={item.href || "#"} style={{ background: item.bg, borderRadius: 12, padding: "18px 14px", textDecoration: "none", display: "block", boxShadow: "var(--shadow)" }}>
                  <div style={{ color: item.color, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: item.color, opacity: 0.75, marginBottom: 4, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: item.color, fontSize: 13, lineHeight: 1.4 }}>{item.val}</div>
                </a>
              ))}
            </div>
            <MapBlock config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
