# CMS 10 - Đơn Hàng Và Sidebar Admin

## Thay đổi trang đơn hàng

- Cập nhật `frontend/src/app/[locale]/quan-tri/don-hang/page.tsx`.
- Bộ lọc gửi params lên API:
  - `GET /api/admin/orders/?status=&search=`
  - Filter trạng thái: tất cả, chờ xác nhận, đã xác nhận, đang giao, đã giao, đã hủy.
  - Search theo mã đơn hoặc tên/SĐT người nhận.
- Bổ sung cột phương thức thanh toán: COD / VNPay / MoMo.
- Click vào mã đơn mở panel chi tiết bên phải:
  - Thông tin người nhận.
  - Danh sách sản phẩm, số lượng, đơn giá, thành tiền.
  - Tạm tính, phí ship, tổng cộng.
  - Ghi chú đơn hàng.
  - Lịch sử trạng thái cơ bản từ `created_at` và `updated_at`.
  - Cập nhật trạng thái trong panel.

## Thay đổi sidebar

- Cập nhật `frontend/src/app/[locale]/quan-tri/AdminShell.tsx`.
- Sắp xếp lại nav theo thứ tự mới và thêm icon:
  - Dashboard, Đơn hàng, Đánh giá, Sản phẩm, Danh mục SP, Cây trồng, Khuyến mãi, Tin tức, Danh mục TT, Tài liệu, Danh mục TL, Người dùng, Liên hệ, Cấu hình.
- Giữ style active/inactive hiện có.
- Thêm nút `Đăng xuất` dưới thông tin user:
  - Gọi `signOut(auth)`.
  - Gọi `setUser(null)`.
  - Redirect về `/`.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
