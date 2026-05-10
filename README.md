# Được Mùa — Deploy Guide

> Stack: Django 6 + PostgreSQL (backend :8000) · Next.js 16 (frontend :3000)  
> Repo: https://github.com/huygiangit96/duocmuavn.git

---

## 1. Yêu cầu

```bash
# Ubuntu 22.04 LTS
apt update && apt upgrade -y
apt install -y git python3 python3-venv python3-pip postgresql postgresql-contrib

# Node.js 20 + npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs npm

# PM2
npm install -g pm2

# Mở port firewall
ufw allow 8000 && ufw allow 3000
```

---

## 2. Clone dự án

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/huygiangit96/duocmuavn.git duocmua
cd /var/www/duocmua
```

---

## 3. PostgreSQL — tạo DB & import seed

```bash
# Đặt password cho postgres superuser
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Tạo database
sudo -u postgres psql -c "CREATE DATABASE duocmua OWNER postgres;"

# Import seed data (dùng postgres superuser để tránh lỗi permission)
sudo -u postgres psql duocmua < /var/www/duocmua/scripts/data/duocmua_seed.sql
```

---

## 4. Backend (Django)

```bash
cd /var/www/duocmua/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Cập nhật `.env`** — thay `<VPS_IP>` bằng IP thật:

```ini
# backend/.env
DEBUG=False
SECRET_KEY=duocmua-secret-key-change-in-production
DATABASE_URL=postgres://postgres:postgres@localhost:5432/duocmua
ALLOWED_HOSTS=<VPS_IP>,localhost
CORS_ALLOWED_ORIGINS=http://<VPS_IP>:3000
MEDIA_ROOT=/var/www/duocmua/backend/media/
FIREBASE_CREDENTIALS_PATH=/var/www/duocmua/backend/core/firebase-credentials.json
FRONTEND_URL=http://<VPS_IP>:3000
VNPAY_TMN_CODE=<sandbox_tmn_code>
VNPAY_HASH_SECRET=<sandbox_secret>
MOMO_PARTNER_CODE=<sandbox_partner_code>
MOMO_ACCESS_KEY=<sandbox_access_key>
MOMO_SECRET_KEY=<sandbox_secret_key>
```

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

> **Media files** đã có sẵn trong `backend/media/` từ repo — không cần import thêm.

---

## 5. Gunicorn systemd service

```bash
cat > /etc/systemd/system/duocmua-backend.service <<EOF
[Unit]
Description=Duoc Mua Django Backend
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/var/www/duocmua/backend
ExecStart=/var/www/duocmua/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:8000 \
    core.wsgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable duocmua-backend
systemctl start duocmua-backend
systemctl status duocmua-backend
```

---

## 6. Frontend (Next.js)

```bash
cd /var/www/duocmua/frontend
npm install
```

**Cập nhật `.env.local`** — thay `<VPS_IP>`:

```ini
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://<VPS_IP>:8000/api
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBPykE8wdDBkgG9Dn4NcXgrX4LpZxf8Qno
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=duocmua-6db1f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=duocmua-6db1f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=duocmua-6db1f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=565858572207
NEXT_PUBLIC_FIREBASE_APP_ID=1:565858572207:web:354da1a61ea6ab018e815a
```

```bash
npm run build
```

**PM2:**

```bash
cat > /var/www/duocmua/frontend/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'duocmua-frontend',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/duocmua/frontend',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
    },
  }],
};
EOF

pm2 start /var/www/duocmua/frontend/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

---

## 7. Kiểm tra

| URL | Kết quả |
|-----|-----------------|
| `http://<VPS_IP>:3000` | Trang chủ frontend |
| `http://<VPS_IP>:8000/api/` | API root |
| `http://<VPS_IP>:8000/admin/` | Django admin |
| `http://<VPS_IP>:8000/media/news/<file>` | Media file |

---

## 8. Logs & Troubleshooting

```bash
# Backend
journalctl -u duocmua-backend -f

# Frontend
pm2 logs duocmua-frontend

# Restart
systemctl restart duocmua-backend
pm2 restart duocmua-frontend
```

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| 502 / connection refused | Service chưa chạy | Kiểm tra `systemctl status` / `pm2 status` |
| CORS error | Sai `CORS_ALLOWED_ORIGINS` trong `.env` | Sửa IP, restart backend |
| Media 404 | Sai `MEDIA_ROOT` | Kiểm tra path tuyệt đối trong `.env` |
| DB auth failed | Sai user/pass PostgreSQL | Kiểm tra `DATABASE_URL` |
| Port bị chặn | Firewall VPS/cloud | Mở port trong console của nhà cung cấp VPS |

---

## 9. Deploy khi có code mới

```bash
cd /var/www/duocmua
git pull

# Backend
cd backend && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
systemctl restart duocmua-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart duocmua-frontend
```
