# Báo cáo Fix Bước 4.3 - Làm lại layout theo prototype

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

Đã làm lại layout frontend theo hướng bám sát prototype `prototype_new/dm-components.jsx`, `prototype_new/dm-shell.jsx`, `prototype_new/dm-styles.css`.

Không cập nhật `PROGRESS.md` vì đây là fix, không phải bước mới.

## File đã cập nhật/tạo

- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/CartDrawer.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/components/layout/Providers.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/Stars.tsx`
- `frontend/src/components/Toast.tsx`
- `frontend/src/components/icons.tsx`
- `frontend/src/lib/utils.ts`
- `frontend/src/lib/store.ts`

## Chi tiết thay đổi

### CSS global

- Thay CSS hiện tại bằng nội dung từ `prototype_new/dm-styles.css`:
  - `:root` variables
  - `body::before` background nông nghiệp
  - `.container`
  - media queries `.desk-nav`, `.mob-nav-btn`, `.hide-sm`, `.hide-xs`
  - keyframes `toastIn`, `fadeUp`
- Thêm `body { padding-top: 108px; }` để offset fixed header.
- Font `Be Vietnam Pro` đã được import.

Lưu ý kỹ thuật: `@import` font không thể đặt ở cuối file vì Turbopack báo lỗi CSS. Đã chuyển `@import` lên đầu file để build pass; nội dung prototype và body offset vẫn được giữ.

### Header

- Làm lại theo `const Header` trong prototype:
  - top strip xanh dương
  - logo `Được Mùa GAH`
  - subtitle `NÔNG NGHIỆP VIỆT`
  - nav desktop `.desk-nav`
  - hamburger `.mob-nav-btn`
  - icon search/cart/user
  - search Enter chuyển đến `/san-pham?search=...`
- Dùng `usePathname()` để active nav.
- Dùng `Link` cho route Next.js.
- Giỏ hàng đọc từ `useCartStore`.
- User đọc từ `useUserStore`.

### CartDrawer

- Làm lại theo `CartPanel` trong prototype:
  - drawer slide từ phải
  - overlay mờ
  - empty state
  - tăng/giảm/xóa item
  - tổng tạm tính
  - `Mua sắm ngay` link `/san-pham`
  - `Đặt Hàng Ngay` link `/thanh-toan`

### Footer

- Làm lại theo `Footer` prototype:
  - nền `#0d1f08`
  - 4 cột: logo, Sản Phẩm, Hỗ Trợ, Liên Hệ + map
  - danh mục gọi `GET /api/categories/` bằng React Query
  - fallback danh mục hardcode nếu lỗi/backend chưa chạy
  - OpenStreetMap embed
  - `Trang quản trị` link `/quan-tri`

### ProductCard

- Làm lại theo `ProductCard` prototype:
  - inline styles
  - hover transform/border/shadow
  - tag/promo badge
  - placeholder SVG giống prototype khi chưa có ảnh
  - nếu có ảnh thật thì dùng `product.images[0].image` hoặc `product.thumbnail`
  - click card chuyển `/san-pham/<slug>`
  - nút `Thêm` gọi `useCartStore.addItem(product)` và hiện toast

### Helpers

- `fmt` trong `frontend/src/lib/utils.ts`
- `Stars` trong `frontend/src/components/Stars.tsx`
- `Toast` trong `frontend/src/components/Toast.tsx`
- SVG icon set trong `frontend/src/components/icons.tsx`
- Toast state trong Zustand store.

### Providers/Layout

- Root layout bỏ Tailwind layout classes, dùng CSS prototype.
- Providers thêm:
  - `QueryClientProvider`
  - `useAuth`
  - `Header`
  - `Footer`
  - `CartDrawer`
  - `Toast`
  - floating phone + Zalo buttons giống prototype shell.

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

Đã kiểm tra `http://localhost:3000` bằng HTTP:

- Status `200`
- HTML có `Được Mùa GAH`
- HTML có `Hotline:`
- HTML có `Trang quản trị`
- HTML có OpenStreetMap embed.

## Kết luận

Layout đã được làm lại theo prototype với inline styles và CSS variables. Header/Footer/CartDrawer/ProductCard hiện bám sát cấu trúc prototype hơn phiên bản Tailwind trước đó.
