"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { IC, dmBtn, dmIcon, dmInput, dmOutline } from "@/components/icons";
import { Link, useRouter } from "@/i18n/navigation";
import { auth } from "@/lib/firebase";
import { useToastStore, useUserStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import api from "@/lib/api";
import type { Address, Commune, Order, PaginatedResponse, Province } from "@/types";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  firebase_uid?: string;
  created_at?: string;
}

interface ProfileForm {
  name: string;
  phone: string;
}

interface AddressForm {
  id?: number;
  label: string;
  receiver_name: string;
  phone: string;
  province: string;
  commune: string;
  address_line: string;
  is_default: boolean;
}

const emptyAddressForm: AddressForm = {
  label: "Nhà riêng",
  receiver_name: "",
  phone: "",
  province: "",
  commune: "",
  address_line: "",
  is_default: false,
};

const statusColor: Record<Order["status"], string> = {
  pending: "var(--orange)",
  confirmed: "var(--blue)",
  shipping: "var(--orange)",
  delivered: "var(--green)",
  cancelled: "#c0392b",
};

const getResults = <T,>(data: T[] | PaginatedResponse<T>) => Array.isArray(data) ? data : data.results;

async function fetchProfile() {
  const response = await api.get<UserProfile>("/account/profile/");
  return response.data;
}

async function updateProfile(values: ProfileForm) {
  const response = await api.put<UserProfile>("/account/profile/", values);
  return response.data;
}

async function fetchOrders() {
  const response = await api.get<Order[] | PaginatedResponse<Order>>("/orders/");
  return getResults(response.data);
}

async function cancelOrder(orderNumber: string) {
  const response = await api.post<Order>(`/orders/${orderNumber}/cancel/`);
  return response.data;
}

async function fetchAddresses() {
  const response = await api.get<Address[] | PaginatedResponse<Address>>("/account/addresses/");
  return getResults(response.data);
}

async function fetchProvinces() {
  const response = await api.get<Province[] | PaginatedResponse<Province>>("/provinces/");
  return getResults(response.data);
}

async function fetchCommunes(provinceId: string) {
  const response = await api.get<Commune[] | PaginatedResponse<Commune>>(`/communes/?province=${provinceId}`);
  return getResults(response.data);
}

async function saveAddress(values: AddressForm) {
  const payload = {
    label: values.label,
    receiver_name: values.receiver_name,
    phone: values.phone,
    address_line: values.address_line,
    province: Number(values.province),
    commune: Number(values.commune),
    is_default: values.is_default,
  };

  if (values.id) {
    const response = await api.put<Address>(`/account/addresses/${values.id}/`, payload);
    return response.data;
  }

  const response = await api.post<Address>("/account/addresses/", payload);
  return response.data;
}

async function deleteAddress(id: number) {
  await api.delete(`/account/addresses/${id}/`);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  return source[0]?.toUpperCase() || "U";
}

function useOrderStatusLabel() {
  const t = useTranslations();
  return (status: Order["status"]) => ({
    pending: t("account.status_pending"),
    confirmed: t("account.status_confirmed"),
    shipping: t("account.status_shipping"),
    delivered: t("account.status_delivered"),
    cancelled: t("account.status_cancelled"),
  })[status];
}

function DetailOrder({ order, onBack, onCancel, cancelling }: { order: Order; onBack: () => void; onCancel: () => void; cancelling: boolean }) {
  const t = useTranslations();
  const statusLabel = useOrderStatusLabel();
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ padding: "0 0 56px", background: "var(--bg-subtle)", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <button type="button" onClick={onBack} style={{ ...dmIcon, marginBottom: 16, color: "var(--blue)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font)" }}><IC.ChevL />Quay lại danh sách</button>

        <div style={{ background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <h2 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 22, lineHeight: 1.3, wordBreak: "break-word" }}>Đơn hàng #{order.order_number}</h2>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Đặt ngày {formatDate(order.created_at)}</div>
            </div>
            <span style={{ background: `${statusColor[order.status]}20`, color: statusColor[order.status], padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{statusLabel(order.status)}</span>
          </div>

          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Sản phẩm ({totalQty})</h3>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)" }}><IC.CartBase /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.product_name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>SL: {item.quantity} · {fmt(Number(item.product_price))}</div>
              </div>
              <div style={{ fontWeight: 800, color: "var(--blue)" }}>{fmt(Number(item.subtotal))}</div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22, fontSize: 13 }} className="contact-grid">
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: 5, fontWeight: 600 }}>Địa chỉ giao hàng</div>
              <div style={{ lineHeight: 1.6 }}>{order.receiver_name}<br />{order.receiver_phone}<br />{order.receiver_address}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: 5, fontWeight: 600 }}>Thanh toán</div>
              <div>{order.payment_method.toUpperCase()} · {order.payment_status}</div>
              {order.note && <div style={{ marginTop: 8, color: "var(--text-muted)", lineHeight: 1.5 }}>Ghi chú: {order.note}</div>}
            </div>
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "2px solid var(--border)", display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>Tạm tính</span><strong>{fmt(Number(order.subtotal))}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>Phí vận chuyển</span><strong>{fmt(Number(order.shipping_fee))}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Tổng cộng</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "var(--blue)" }}>{fmt(Number(order.total))}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            {order.status === "pending" && <button type="button" onClick={onCancel} disabled={cancelling} style={dmOutline("#c0392b")}>{cancelling ? t("common.loading") : t("account.cancel_order")}</button>}
            <Link href="/lien-he" style={{ ...dmOutline(), textDecoration: "none" }}><IC.Phone />Liên hệ hỗ trợ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const t = useTranslations();
  const statusLabel = useOrderStatusLabel();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.showToast);
  const [tab, setTab] = useState<"profile" | "orders" | "address">("profile");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<ProfileForm>>({});
  const [addressForm, setAddressForm] = useState<AddressForm | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/dang-nhap?next=/tai-khoan");
    }
  }, [router, user]);

  const { data: profile } = useQuery({ queryKey: ["account-profile"], queryFn: fetchProfile, enabled: Boolean(user), retry: false });
  const { data: orders = [] } = useQuery({ queryKey: ["account-orders"], queryFn: fetchOrders, enabled: Boolean(user), retry: false });
  const { data: addresses = [] } = useQuery({ queryKey: ["account-addresses"], queryFn: fetchAddresses, enabled: Boolean(user), retry: false });
  const { data: provinces = [] } = useQuery({ queryKey: ["provinces"], queryFn: fetchProvinces, enabled: Boolean(user), retry: false });
  const { data: communes = [] } = useQuery({ queryKey: ["communes", addressForm?.province], queryFn: () => fetchCommunes(addressForm?.province || ""), enabled: Boolean(user && addressForm?.province), retry: false });

  const stats = useMemo(() => [
    { label: "Tổng đơn hàng", val: orders.length, color: "var(--blue)" },
    { label: "Chờ xác nhận", val: orders.filter((order) => order.status === "pending").length, color: "var(--orange)" },
    { label: "Đang giao", val: orders.filter((order) => order.status === "shipping").length, color: "var(--orange)" },
    { label: "Đã giao", val: orders.filter((order) => order.status === "delivered").length, color: "var(--green)" },
  ], [orders]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-profile"] });
      showToast("Đã cập nhật hồ sơ");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["account-orders"] });
      setSelectedOrder(order);
      showToast("Đã hủy đơn hàng");
    },
  });

  const saveAddressMutation = useMutation({
    mutationFn: saveAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      setAddressForm(null);
      showToast("Đã lưu địa chỉ");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      showToast("Đã xóa địa chỉ");
    },
  });

  const logout = async () => {
    await signOut(auth);
    setUser(null, null);
    router.replace("/");
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfileMutation.mutate({
      name: profileForm.name ?? profile?.name ?? user?.displayName ?? "",
      phone: profileForm.phone ?? profile?.phone ?? "",
    });
  };

  const submitAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressForm) return;
    saveAddressMutation.mutate(addressForm);
  };

  const editAddress = (address: Address) => {
    setAddressForm({
      id: address.id,
      label: address.label,
      receiver_name: address.receiver_name,
      phone: address.phone,
      province: address.province ? String(address.province) : "",
      commune: address.commune ? String(address.commune) : "",
      address_line: address.address_line,
      is_default: address.is_default,
    });
  };

  if (!user) {
    return <div style={{ padding: "120px 0", textAlign: "center", color: "var(--text-muted)" }}>Đang chuyển đến trang đăng nhập...</div>;
  }

  if (selectedOrder) {
    return (
      <DetailOrder
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onCancel={() => cancelMutation.mutate(selectedOrder.order_number)}
        cancelling={cancelMutation.isPending}
      />
    );
  }

  const displayName = (profileForm.name ?? profile?.name) || user.displayName || "Khách hàng";
  const email = profile?.email || user.email || "";
  const profilePhone = profileForm.phone ?? profile?.phone ?? "";

  return (
    <div style={{ padding: "0 0 56px", background: "var(--bg-subtle)", minHeight: "100vh" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 22 }} className="account-grid">
          <div>
            <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "var(--shadow)", marginBottom: 14, textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--green))", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff" }}>{initials(displayName, email)}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", wordBreak: "break-word" }}>{email}</div>
              <div style={{ marginTop: 10, padding: "4px 10px", background: "#f0f7e0", color: "var(--green-dark)", fontSize: 11, fontWeight: 700, borderRadius: 20, display: "inline-block" }}>Khách hàng</div>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
              {[
                ["profile", "Hồ Sơ"],
                ["orders", "Đơn Hàng"],
                ["address", "Địa Chỉ"],
              ].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setTab(key as typeof tab)} style={{ width: "100%", textAlign: "left", padding: "13px 18px", cursor: "pointer", border: "none", borderBottom: "1px solid var(--border)", background: tab === key ? "#e8f4e0" : "#fff", color: tab === key ? "var(--green-dark)" : "var(--text)", fontWeight: tab === key ? 700 : 400, fontSize: 14, transition: "all 0.2s", fontFamily: "var(--font)" }}>{label}</button>
              ))}
              <button type="button" onClick={logout} style={{ width: "100%", textAlign: "left", padding: "13px 18px", cursor: "pointer", color: "#c0392b", fontWeight: 600, fontSize: 14, border: "none", background: "#fff", fontFamily: "var(--font)" }}>Đăng xuất</button>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)" }}>
            {tab === "profile" && (
              <>
                <h3 style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 20 }}>Xin chào, {displayName}!</h3>
                <p style={{ margin: "0 0 22px", color: "var(--text-muted)", fontSize: 14 }}>Quản lý hồ sơ và thông tin liên hệ của bạn.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 26 }}>
                  {stats.map((item) => (
                    <div key={item.label} style={{ background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`, border: `1.5px solid ${item.color}30`, borderRadius: 12, padding: "16px 14px" }}>
                      <div style={{ fontSize: 30, fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.val}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={submitProfile}>
                  <h3 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 18 }}>Hồ Sơ</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Họ tên</label>
                    <input value={profileForm.name ?? profile?.name ?? user.displayName ?? ""} onChange={(event) => setProfileForm((form) => ({ ...form, name: event.target.value }))} style={dmInput} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Email</label>
                    <input value={email} readOnly style={{ ...dmInput, background: "#f8faf5", color: "var(--text-muted)" }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Số điện thoại</label>
                    <input value={profilePhone} onChange={(event) => setProfileForm((form) => ({ ...form, phone: event.target.value }))} style={dmInput} />
                  </div>
                  {updateProfileMutation.isError && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 14, fontWeight: 600, padding: "8px 12px", background: "#fce8ea", borderRadius: 8 }}>Không thể cập nhật hồ sơ.</div>}
                  <button type="submit" disabled={updateProfileMutation.isPending} style={dmBtn("var(--green)")}>{updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</button>
                </form>
              </>
            )}

            {tab === "orders" && (
              <>
                <h3 style={{ margin: "0 0 18px", fontWeight: 800, fontSize: 18 }}>Đơn Hàng</h3>
                {orders.length === 0 && <div style={{ border: "1px dashed var(--border)", borderRadius: 12, padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Bạn chưa có đơn hàng nào.</div>}
                {orders.map((order) => (
                  <div key={order.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 14, transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                      <div><span style={{ fontWeight: 800, color: "var(--blue)", fontSize: 15 }}>#{order.order_number}</span><span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 12 }}>{formatDate(order.created_at)}</span></div>
                      <span style={{ background: `${statusColor[order.status]}20`, color: statusColor[order.status], padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{statusLabel(order.status)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{order.items.map((item) => `${item.product_name} x${item.quantity}`).join(" · ")}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontWeight: 900, color: "var(--blue)", fontSize: 17 }}>{fmt(Number(order.total))}</span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {order.status === "pending" && <button type="button" onClick={() => cancelMutation.mutate(order.order_number)} disabled={cancelMutation.isPending} style={{ ...dmOutline("#c0392b"), padding: "7px 14px", fontSize: 13 }}>Hủy đơn</button>}
                        <button type="button" onClick={() => setSelectedOrder(order)} style={{ ...dmOutline(), padding: "7px 14px", fontSize: 13 }}>Chi tiết</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === "address" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Địa Chỉ</h3>
                  <button type="button" onClick={() => setAddressForm(emptyAddressForm)} style={dmOutline()}><IC.Plus />Thêm địa chỉ mới</button>
                </div>

                {addresses.length === 0 && !addressForm && <div style={{ border: "1px dashed var(--border)", borderRadius: 12, padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Bạn chưa lưu địa chỉ nào.</div>}

                {addresses.map((address) => (
                  <div key={address.id} style={{ border: address.is_default ? "2px solid var(--blue)" : "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800 }}>{address.label} · {address.receiver_name}</span>
                      {address.is_default && <span style={{ background: "#e8f0fb", color: "var(--blue)", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 4 }}>Mặc định</span>}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{address.phone}<br />{address.address_line}, {address.commune_detail?.name || ""}, {address.province_detail?.name || ""}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button type="button" onClick={() => editAddress(address)} style={{ ...dmOutline(), padding: "7px 13px", fontSize: 12 }}>Sửa</button>
                      <button type="button" onClick={() => deleteAddressMutation.mutate(address.id)} style={{ ...dmOutline("#c0392b"), padding: "7px 13px", fontSize: 12 }}>Xóa</button>
                    </div>
                  </div>
                ))}

                {addressForm && (
                  <form onSubmit={submitAddress} style={{ marginTop: 18, border: "1px solid var(--border)", borderRadius: 14, padding: 18, background: "var(--bg-subtle)" }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>{addressForm.id ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="contact-grid">
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Nhãn</label>
                        <input value={addressForm.label} onChange={(event) => setAddressForm((form) => form && ({ ...form, label: event.target.value }))} style={dmInput} />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Người nhận</label>
                        <input required value={addressForm.receiver_name} onChange={(event) => setAddressForm((form) => form && ({ ...form, receiver_name: event.target.value }))} style={dmInput} />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Số điện thoại</label>
                        <input required value={addressForm.phone} onChange={(event) => setAddressForm((form) => form && ({ ...form, phone: event.target.value }))} style={dmInput} />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Tỉnh/TP</label>
                        <select required value={addressForm.province} onChange={(event) => setAddressForm((form) => form && ({ ...form, province: event.target.value, commune: "" }))} style={dmInput}>
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Xã/Phường</label>
                        <select required value={addressForm.commune} onChange={(event) => setAddressForm((form) => form && ({ ...form, commune: event.target.value }))} style={dmInput} disabled={!addressForm.province}>
                          <option value="">Chọn xã/phường</option>
                          {communes.map((commune) => <option key={commune.id} value={commune.id}>{commune.name}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-muted)" }}>Địa chỉ cụ thể</label>
                        <input required value={addressForm.address_line} onChange={(event) => setAddressForm((form) => form && ({ ...form, address_line: event.target.value }))} style={dmInput} />
                      </div>
                    </div>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-muted)", marginBottom: 16, cursor: "pointer" }}>
                      <input type="checkbox" checked={addressForm.is_default} onChange={(event) => setAddressForm((form) => form && ({ ...form, is_default: event.target.checked }))} style={{ accentColor: "var(--green)" }} />
                      Đặt làm địa chỉ mặc định
                    </label>
                    {saveAddressMutation.isError && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 14, fontWeight: 600, padding: "8px 12px", background: "#fce8ea", borderRadius: 8 }}>Không thể lưu địa chỉ.</div>}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="submit" disabled={saveAddressMutation.isPending} style={dmBtn("var(--green)")}>{saveAddressMutation.isPending ? "Đang lưu..." : "Lưu địa chỉ"}</button>
                      <button type="button" onClick={() => setAddressForm(null)} style={dmOutline()}>Hủy</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
