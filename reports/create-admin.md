# Create Admin Account

## Kết quả

- Đã tạo/cập nhật tài khoản Firebase và Django admin.
- Email: `admin@duocmua.vn`
- Firebase UID: `hKv2KlyjDwNMcqtUMIxrPwIEFsG3`
- Quyền Django: `is_staff=True`, `is_superuser=True`
- UserProfile đã liên kết bằng `firebase_uid` và `full_name`.

## Thay đổi kỹ thuật

- Tạo management command `backend/core/management/commands/create_admin.py`.
- Bổ sung field `UserProfile.full_name`.
- Tạo và áp dụng migration `accounts.0004_userprofile_full_name`.
- Đã chạy `backend/manage.py check`: không có lỗi.

## Ghi chú bảo mật

- Không lưu password trong report.
- Sau khi đăng nhập lần đầu, nên đổi password admin trong Firebase Console hoặc qua chức năng quản trị tài khoản phù hợp.
