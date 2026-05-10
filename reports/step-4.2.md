# Báo cáo Bước 4.2 - Cấu hình cấu trúc Frontend

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã tạo các file nền trong `frontend/src/` để chuẩn bị cho các trang frontend:

- `frontend/src/lib/api.ts`
- `frontend/src/lib/firebase.ts`
- `frontend/src/lib/store.ts`
- `frontend/src/types/index.ts`
- `frontend/src/hooks/useAuth.ts`

## Chi tiết

### API client

`frontend/src/lib/api.ts`:

- Tạo axios instance với `baseURL = process.env.NEXT_PUBLIC_API_URL`.
- Thêm request interceptor.
- Nếu Firebase đang có user đăng nhập, interceptor gọi `user.getIdToken()` và gắn:
  - `Authorization: Bearer <token>`
- Export default `api`.

### Firebase

`frontend/src/lib/firebase.ts`:

- Khởi tạo Firebase app từ các biến `NEXT_PUBLIC_FIREBASE_*` trong `.env.local`.
- Dùng `getApps()` để tránh initialize trùng khi hot reload.
- Export:
  - `firebaseApp`
  - `auth`

### Zustand store

`frontend/src/lib/store.ts`:

- `useCartStore`:
  - `items`
  - `addItem`
  - `removeItem`
  - `updateQty`
  - `clearCart`
  - `totalPrice`
- `useUserStore`:
  - `user`
  - `token`
  - `setUser`

### TypeScript types

`frontend/src/types/index.ts`:

- Đã định nghĩa các interface khớp response API backend hiện có:
  - `Product`
  - `Category`
  - `Plant`
  - `Order`
  - `OrderItem`
  - `Article`
  - `Document`
  - `Address`
  - `CartItem`
  - `SiteConfig`
- Bổ sung type hỗ trợ cho response liên quan:
  - `PaginatedResponse`
  - `ProductImage`
  - `NewsCategory`
  - `Hashtag`
  - `DocCategory`
  - `Province`
  - `Commune`
  - `FirebaseUser`

### Auth hook

`frontend/src/hooks/useAuth.ts`:

- Client hook dùng `onAuthStateChanged`.
- Khi Firebase user thay đổi:
  - Nếu logout: clear `user` và `token`.
  - Nếu login: gọi `getIdToken()` và lưu cả user/token vào `useUserStore`.

## Kiểm thử

Đã chạy:

```powershell
npm run build
```

Kết quả:

- Next.js compile thành công.
- TypeScript check thành công.
- Static pages generate thành công.
- Không có lỗi build.

## Kết luận

Bước 4.2 đã hoàn thành. Frontend đã có API client, Firebase init, Zustand stores, auth hook và type definitions để dùng cho các màn hình shop/admin tiếp theo.
