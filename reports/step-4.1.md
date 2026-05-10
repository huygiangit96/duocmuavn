# Báo cáo Bước 4.1 - Tạo Next.js Project

Ngày thực hiện: 2026-05-05

## Phạm vi đã thực hiện

- Khởi tạo Next.js project tại `frontend/`.
- Cấu hình theo plan:
  - TypeScript
  - Tailwind CSS
  - App Router
  - `src/` directory
  - Không giữ Git repo con trong `frontend/`
- Cài các dependency frontend theo plan.
- Tạo `frontend/.env.local` với API URL và Firebase public config.

## Phiên bản chính

- Next.js: `16.2.4`
- React: `19.2.4`
- React DOM: `19.2.4`
- TypeScript: `^5`
- Tailwind CSS: `^4`

## Dependencies đã cài

- `axios@1.16.0`
- `@tanstack/react-query@5.100.9`
- `zustand@5.0.13`
- `firebase@12.12.1`
- `react-hook-form@7.75.0`
- `@hookform/resolvers@5.2.2`
- `zod@4.4.3`
- `lucide-react@1.14.0`
- `next-themes@0.4.6`

## File môi trường

Đã tạo `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Kiểm thử

Đã chạy:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Kết quả:

- Next.js server ready tại `http://127.0.0.1:3000`
- `GET /` trả `200`
- Log lưu tại `reports/step-4.1-dev.out.log`

Đã chạy thêm:

```powershell
npm run lint
```

Kết quả: pass, không có lỗi ESLint.

## Lưu ý

- `npm install` báo còn `2 moderate severity vulnerabilities` từ dependency tree hiện tại. Chưa chạy `npm audit fix --force` vì có thể kéo thay đổi breaking version ngoài phạm vi Bước 4.1.

## Kết luận

Bước 4.1 đã hoàn thành. Project Next.js đã được khởi tạo tại `frontend/`, dependencies và Firebase env đã sẵn sàng, dev server chạy thành công.
