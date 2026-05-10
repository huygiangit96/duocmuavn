"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { IC, dmBtn, dmInput, dmOutline } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { useCartStore, useToastStore, useUserStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import type { Commune, Order, Province } from "@/types";

const checkoutSchema = z.object({
  receiver_name: z.string().min(2),
  receiver_phone: z.string().min(8),
  province: z.string().min(1),
  commune: z.string().min(1),
  address_line: z.string().min(5),
  note: z.string().optional(),
  payment_method: z.enum(["cod", "vnpay", "momo"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const SHIPPING_FEE = 30000;
const FREE_SHIP_MIN = 500000;

async function fetchProvinces() {
  const response = await api.get<Province[]>("/provinces/");
  return response.data;
}

async function fetchCommunes(provinceId: string) {
  const response = await api.get<Commune[]>(`/communes/?province=${provinceId}`);
  return response.data;
}

function itemPrice(item: ReturnType<typeof useCartStore.getState>["items"][number]) {
  return Number(item.product.sale_price ?? item.product.price ?? 0);
}

function CheckoutContent() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  const showToast = useToastStore((state) => state.showToast);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiver_name: "",
      receiver_phone: "",
      province: "",
      commune: "",
      address_line: "",
      note: "",
      payment_method: "cod",
    },
  });

  useEffect(() => {
    if (!user && !token) {
      router.replace("/dang-nhap?next=/thanh-toan");
    }
  }, [router, token, user]);

  const watchedValues = useWatch({ control });
  const provinceId = watchedValues.province || "";
  const selectedCommune = watchedValues.commune || "";
  const paymentMethod = watchedValues.payment_method || "cod";

  const { data: provinces = [] } = useQuery({
    queryKey: ["checkout-provinces"],
    queryFn: fetchProvinces,
    retry: false,
  });
  const { data: communes = [] } = useQuery({
    queryKey: ["checkout-communes", provinceId],
    queryFn: () => fetchCommunes(provinceId),
    enabled: Boolean(provinceId),
    retry: false,
  });

  const selectedProvinceName = provinces.find((item) => String(item.id) === provinceId)?.name || "";
  const selectedCommuneName = communes.find((item) => String(item.id) === selectedCommune)?.name || "";

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0),
    [cart],
  );
  const shipping = subtotal >= FREE_SHIP_MIN ? 0 : SHIPPING_FEE;
  const discount = promoApplied?.discount_amount ?? 0;
  const total = subtotal + shipping - discount;
  const steps = [t("order.step_delivery"), t("order.step_payment"), t("order.step_confirm")];

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoApplied(null);
    try {
      const res = await api.post<{
        valid: boolean;
        code: string;
        discount_amount: number;
        message: string;
      }>("/promotions/validate/", {
        code: promoCode.trim().toUpperCase(),
        order_value: subtotal,
      });
      if (res.data.valid) {
        setPromoApplied(res.data);
      } else {
        setPromoError(res.data.message);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setPromoError(
        error?.response?.data?.message || "Mã giảm giá không hợp lệ."
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const goToStepTwo = async () => {
    const ok = await trigger([
      "receiver_name",
      "receiver_phone",
      "province",
      "commune",
      "address_line",
    ]);
    if (ok) setStep(2);
  };

  const submitOrder = async (values: CheckoutFormValues) => {
    if (!user && !token) {
      setApiError(t("auth.login_required"));
      router.push("/dang-nhap?next=/thanh-toan");
      return;
    }
    if (!cart.length) {
      setApiError(t("cart.empty"));
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      const receiverAddress = [
        values.address_line,
        selectedCommuneName,
        selectedProvinceName,
      ].filter(Boolean).join(", ");

      const response = await api.post<Order>("/orders/", {
        payment_method: values.payment_method,
        receiver_name: values.receiver_name,
        receiver_phone: values.receiver_phone,
        receiver_address: receiverAddress,
        note: values.note || "",
        promotion_code: promoApplied?.code || "",
        items: cart.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (values.payment_method === "vnpay" || values.payment_method === "momo") {
        const endpoint = values.payment_method === "vnpay"
          ? "/payments/vnpay/create/"
          : "/payments/momo/create/";
        const paymentResponse = await api.post<{ payment_url: string }>(endpoint, {
          order_number: response.data.order_number,
        });
        clearCart();
        window.location.assign(paymentResponse.data.payment_url);
        return;
      }

      clearCart();
      showToast(t("order.success"));
      router.push(`/thanh-toan/xac-nhan?order=${response.data.order_number}`);
    } catch (error) {
      setApiError(getApiError(error, t("common.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "0 0 56px", background: "var(--bg-subtle)", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>{t("order.place_order")}</h1>

        <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
          {steps.map((s, i) => (
            <span key={s} style={{ display: "contents" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: step > i + 1 ? "var(--green)" : step === i + 1 ? "var(--blue)" : "#dde", color: step >= i + 1 ? "#fff" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? "var(--blue)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "var(--green)" : "#dde", margin: "0 10px" }} />}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit(submitOrder)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start" }} className="checkout-grid">
            <div style={{ background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)" }}>
              {step === 1 && (
                <>
                  <h3 style={{ margin: "0 0 20px", fontWeight: 800 }}>{t("order.delivery_info")}</h3>
                  <Field label={`${t("order.receiver_name")} *`} error={errors.receiver_name && t("common.error")}>
                    <input {...register("receiver_name")} style={dmInput} />
                  </Field>
                  <Field label={`${t("order.phone")} *`} error={errors.receiver_phone && t("common.error")}>
                    <input {...register("receiver_phone")} style={dmInput} />
                  </Field>
                  <Field label={`${t("order.province")} *`} error={errors.province && t("common.error")}>
                    <select {...register("province")} style={{ ...dmInput, cursor: "pointer" }}>
                      <option value="">{t("order.province")}</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`${t("order.commune")} *`} error={errors.commune && t("common.error")}>
                    <select {...register("commune")} disabled={!provinceId} style={{ ...dmInput, cursor: provinceId ? "pointer" : "not-allowed", opacity: provinceId ? 1 : 0.65 }}>
                      <option value="">{t("order.commune")}</option>
                      {communes.map((commune) => (
                        <option key={commune.id} value={commune.id}>{commune.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`${t("order.address")} *`} error={errors.address_line && t("common.error")}>
                    <input {...register("address_line")} style={dmInput} />
                  </Field>
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{t("order.note")}</label>
                    <textarea {...register("note")} style={{ ...dmInput, height: 80, resize: "vertical" }} />
                  </div>
                  <button type="button" onClick={goToStepTwo} style={{ ...dmBtn("var(--blue)"), width: "100%", justifyContent: "center", padding: 14 }}>{t("common.next")} <IC.ChevR /></button>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 style={{ margin: "0 0 20px", fontWeight: 800 }}>{t("order.payment_method")}</h3>
                  <PaymentOption value="cod" label="COD" active={paymentMethod === "cod"} onSelect={() => setValue("payment_method", "cod")} />
                  <PaymentOption value="vnpay" label="VNPay" active={paymentMethod === "vnpay"} onSelect={() => setValue("payment_method", "vnpay")} note="Sandbox" />
                  <PaymentOption value="momo" label="MoMo" active={paymentMethod === "momo"} onSelect={() => setValue("payment_method", "momo")} note="Sandbox" />
                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ ...dmOutline(), flex: 1, justifyContent: "center" }}><IC.ChevL />{t("common.prev")}</button>
                    <button type="button" onClick={() => setStep(3)} style={{ ...dmBtn("var(--blue)"), flex: 1, justifyContent: "center" }}>{t("common.next")} <IC.ChevR /></button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 style={{ margin: "0 0 20px", fontWeight: 800 }}>{t("order.step_confirm")}</h3>
                  <div style={{ background: "var(--bg-subtle)", borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14, lineHeight: 2 }}>
                    <div><strong>{t("order.receiver_name")}:</strong> {watchedValues.receiver_name || "-"}</div>
                    <div><strong>{t("order.phone")}:</strong> {watchedValues.receiver_phone || "-"}</div>
                    <div><strong>{t("order.address")}:</strong> {[watchedValues.address_line, selectedCommuneName, selectedProvinceName].filter(Boolean).join(", ") || "-"}</div>
                    <div><strong>{t("order.payment_method")}:</strong> {paymentMethod === "vnpay" ? "VNPay" : paymentMethod === "momo" ? "MoMo" : "COD"}</div>
                    {watchedValues.note && <div><strong>{t("order.note")}:</strong> {watchedValues.note}</div>}
                  </div>
                  {apiError && <div style={{ background: "#fff3ed", color: "#c0392b", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>{apiError}</div>}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setStep(2)} style={{ ...dmOutline(), flex: 1, justifyContent: "center" }}><IC.ChevL />{t("common.prev")}</button>
                    <button type="submit" disabled={submitting || !cart.length} style={{ ...dmBtn("var(--orange)"), flex: 1, justifyContent: "center", padding: 14, opacity: submitting || !cart.length ? 0.65 : 1 }}>{submitting ? t("common.loading") : t("order.place_order")}</button>
                  </div>
                </>
              )}
            </div>

            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              total={total}
              promoCode={promoCode}
              promoApplied={promoApplied}
              promoError={promoError}
              promoLoading={promoLoading}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={applyPromo}
              onRemovePromo={() => {
                setPromoApplied(null);
                setPromoCode("");
                setPromoError("");
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>{label}</label>
      {children}
      {error && <div style={{ color: "#c0392b", fontSize: 12, fontWeight: 600, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function PaymentOption({
  value,
  label,
  active,
  disabled,
  note,
  onSelect,
}: {
  value: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  note?: string;
  onSelect?: () => void;
}) {
  return (
    <label onClick={disabled ? undefined : onSelect} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "2px solid", borderColor: active ? "var(--blue)" : "var(--border)", background: active ? "#e8f0fb" : "#fff", cursor: disabled ? "not-allowed" : "pointer", marginBottom: 10, transition: "all 0.2s", opacity: disabled ? 0.58 : 1 }}>
      <input type="radio" name="pay" value={value} checked={Boolean(active)} disabled={disabled} readOnly style={{ accentColor: "var(--blue)", width: 18, height: 18 }} />
      <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      {note && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>{note}</span>}
    </label>
  );
}

function OrderSummary({
  subtotal,
  shipping,
  discount,
  total,
  promoCode,
  promoApplied,
  promoError,
  promoLoading,
  onPromoCodeChange,
  onApplyPromo,
  onRemovePromo,
}: {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode: string;
  promoApplied: { code: string; discount_amount: number; message: string } | null;
  promoError: string;
  promoLoading: boolean;
  onPromoCodeChange: (v: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}) {
  const t = useTranslations();
  const cart = useCartStore((state) => state.items);

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "var(--shadow)" }}>
      <h3 style={{ margin: "0 0 14px", fontWeight: 800, fontSize: 15 }}>{t("order.order_summary")} ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
      {cart.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
          {t("cart.empty")} <Link href="/san-pham" style={{ color: "var(--blue)", fontWeight: 700 }}>{t("cart.shop_now")}</Link>
        </div>
      ) : (
        cart.map((item) => {
          const price = Number(item.product.sale_price ?? item.product.price ?? 0);
          return (
            <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ flex: 1, paddingRight: 8 }}>{item.product.name} <span style={{ color: "var(--text-muted)" }}>x{item.quantity}</span></span>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>{fmt(price * item.quantity)}</span>
            </div>
          );
        })
      )}
      {/* Mã giảm giá */}
      <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Mã giảm giá</div>
        {promoApplied ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f7e0", borderRadius: 8, padding: "8px 12px", border: "1px solid var(--green)" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--green-dark)" }}>{promoApplied.code}</div>
              <div style={{ fontSize: 12, color: "var(--green-dark)" }}>{promoApplied.message}</div>
            </div>
            <button
              type="button"
              onClick={onRemovePromo}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontWeight: 700, fontSize: 18, lineHeight: 1, padding: "0 4px" }}
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onApplyPromo(); } }}
                placeholder="Nhập mã giảm giá"
                style={{ ...dmInput, flex: 1, fontSize: 13 }}
              />
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                style={{ ...dmBtn("var(--blue)"), padding: "0 14px", fontSize: 13, flexShrink: 0, opacity: promoLoading || !promoCode.trim() ? 0.65 : 1 }}
              >
                {promoLoading ? "..." : "Áp dụng"}
              </button>
            </div>
            {promoError && (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--orange)", fontWeight: 600 }}>
                {promoError}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ paddingTop: 12, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
          <span>{t("order.subtotal")}</span><span>{fmt(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
          <span>{t("order.shipping_fee")}</span><span style={{ color: shipping === 0 ? "var(--green)" : "inherit" }}>{shipping === 0 ? t("order.free_shipping") : fmt(shipping)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", color: "var(--green-dark)" }}>
            <span>Giảm giá ({promoApplied?.code})</span>
            <span style={{ fontWeight: 700 }}>-{fmt(discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontWeight: 800, fontSize: 17, color: "var(--blue)", borderTop: "2px solid var(--border)", marginTop: 6 }}>
          <span>{t("order.total")}</span><span>{fmt(total)}</span>
        </div>
        {shipping === 0 && <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{t("order.free_shipping")}</div>}
      </div>
    </div>
  );
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const data = (error.response as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data) {
      if ("detail" in data && typeof data.detail === "string") return data.detail;
      return JSON.stringify(data);
    }
  }
  return fallback;
}

export default function CheckoutPage() {
  const t = useTranslations();

  return (
    <Suspense fallback={<div style={{ padding: "0 0 56px" }}><div className="container">{t("common.loading")}</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
