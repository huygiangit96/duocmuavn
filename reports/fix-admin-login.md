# Fix Admin Login Redirect

## Thay đổi

- Cập nhật `frontend/src/app/[locale]/dang-nhap/page.tsx`.
- Sửa endpoint kiểm tra quyền admin:
  - Từ `/api/admin/stats/`
  - Thành `/admin/stats/`
- Lý do: axios instance đã có `baseURL = http://localhost:8000/api`, nên gọi `/api/admin/stats/` gây URL double `/api/api/admin/stats/`.
- Sửa logic `useEffect` khi user đã đăng nhập sẵn:
  - Không redirect thẳng về `/`.
  - Gọi `redirectAfterLogin(user)` để kiểm tra role trước.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
