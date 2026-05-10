# Báo cáo Bước 4.3 - Layout chung Header, Footer, CartDrawer

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã xây dựng layout chung cho frontend dựa trên tinh thần UI của prototype `prototype_new/dm-shell.jsx` và `prototype_new/dm-components.jsx`.

## File đã tạo/cập nhật

- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/CartDrawer.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/components/layout/Providers.tsx`
- `frontend/src/components/layout/index.ts`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/globals.css`

## Header

- Logo chữ "Được Mùa", link về `/`.
- Menu desktop:
  - `/san-pham`
  - `/tin-tuc`
  - `/tai-lieu`
  - `/lien-he`
- Icon giỏ hàng dùng `useCartStore`, có badge tổng số lượng.
- Nút đăng nhập khi chưa có Firebase user.
- Avatar/tài khoản khi đã có user trong `useUserStore`.
- Menu hamburger cho mobile.

## CartDrawer

- Drawer slide từ phải.
- Đọc danh sách giỏ hàng từ `useCartStore`.
- Hỗ trợ:
  - tăng số lượng
  - giảm số lượng
  - xóa item
  - tính tổng tiền
- Nút "Đặt hàng" link đến `/thanh-toan`.
- Có trạng thái giỏ hàng trống và link về `/san-pham`.

## Footer

- Logo + mô tả ngắn.
- Nhóm link:
  - Sản phẩm
  - Tin tức
  - Công ty
- Thông tin liên hệ lấy từ `GET /api/config/` thông qua React Query.
- Có fallback hardcode khi backend chưa chạy hoặc endpoint chưa trả dữ liệu.
- Copyright tự động theo năm hiện tại.

## Root Layout

`frontend/src/app/layout.tsx` đã được cập nhật:

- Font Inter từ `next/font/google`.
- Metadata cho Được Mùa.
- Bọc app bằng `Providers`.

`Providers` thực hiện:

- `QueryClientProvider` cho React Query.
- Gọi `useAuth` để lắng nghe Firebase Auth.
- Render `<Header />`, `<Footer />`, `<CartDrawer />`.

## Kiểm thử

Đã chạy:

```powershell
npm run build
npm run lint
```

Kết quả:

- Build pass.
- TypeScript không lỗi.
- ESLint không lỗi.

Đã kiểm tra dev server:

```powershell
Invoke-WebRequest http://localhost:3000
```

Kết quả:

- HTTP status: `200`
- HTML có nội dung Header: `Được Mùa`
- HTML có nội dung Footer: `All rights reserved`

Dev server đang chạy tại `http://localhost:3000`.

## Kết luận

Bước 4.3 đã hoàn thành. Giai đoạn 4 - Khởi tạo Frontend đã hoàn tất 3/3 bước.
