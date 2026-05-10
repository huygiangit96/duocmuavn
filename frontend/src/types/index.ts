import type { User as FirebaseUser } from "firebase/auth";

export type { FirebaseUser };

export type Nullable<T> = T | null;

export interface PaginatedResponse<T> {
  count: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export interface Plant {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  image: string;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: Category;
  plants?: Plant[];
  tag: string;
  price: string;
  sale_price: Nullable<string>;
  specs?: Record<string, string | number | boolean | null>;
  description?: string;
  usage?: string;
  guide?: string;
  thumbnail: Nullable<string>;
  images?: ProductImage[];
  rating?: number;
  reviews_count?: number;
  sale_count?: number;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "vnpay" | "momo";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  note: string;
  vnpay_txn_ref: Nullable<string>;
  momo_txn_ref: Nullable<string>;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Hashtag {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: NewsCategory;
  hashtags: Hashtag[];
  thumbnail: string;
  summary: string;
  author_name: string;
  published_at: Nullable<string>;
  view_count: number;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocCategory {
  id: number;
  name: string;
  slug: string;
}

export type DocumentType = "paper" | "video";

export interface Document {
  id: number;
  title: string;
  slug: string;
  doc_type: DocumentType;
  category: DocCategory;
  plants: Plant[];
  thumbnail: string;
  summary: string;
  file: Nullable<string>;
  video_url: Nullable<string>;
  created_at: string;
  content?: string;
  is_published?: boolean;
  updated_at?: string;
}

export interface Province {
  id: number;
  code: string;
  name: string;
}

export interface Commune {
  id: number;
  code: string;
  name: string;
  province: Province;
}

export interface Address {
  id: number;
  label: string;
  receiver_name: string;
  phone: string;
  address_line: string;
  province: Nullable<number>;
  province_detail: Nullable<Province>;
  commune: Nullable<number>;
  commune_detail: Nullable<Commune>;
  is_default: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  is_active: boolean;
  tag: string;
  bg_color: string;
}

export interface SiteConfig {
  hotline: string;
  zalo_url: string;
  facebook_url: string;
  address: string;
  email: string;
  google_map_embed: string;
  policy_buying: string;
  policy_shipping: string;
  tagline: string;
}
