# Bao cao Buoc 1.3 - Tich hop Firebase Auth

## Ket qua
- Da tao `backend/core/firebase_auth.py`.
- Da tao class `FirebaseAuthentication` ke thua `BaseAuthentication`.
- Auth class doc header `Authorization: Bearer <Firebase ID token>`.
- Khi token hop le, class xac minh qua Firebase Admin SDK va tu tao/lay Django user theo Firebase `uid`.
- `settings.py` da tro san `DEFAULT_AUTHENTICATION_CLASSES` toi `core.firebase_auth.FirebaseAuthentication` tu Buoc 1.2.

## File credentials
- Da co file service account credentials tai:

```text
backend/core/firebase-credentials.json
```

- Kich thuoc file: `2379` bytes.
- LastWriteTime khi kiem tra: `2026-05-05 15:42:13`.

## Kiem tra
Da chay import class:

```bash
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings'); import django; django.setup(); from core.firebase_auth import FirebaseAuthentication; print(FirebaseAuthentication.__name__)"
```

Ket qua:

```text
FirebaseAuthentication
```

Da chay khoi tao Firebase Admin SDK tu credentials:

```bash
python -c "import os, sys; sys.path.insert(0, r'D:\TaiLieuCty\2026\Code\Duocmua_V1\backend'); os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings'); import django; django.setup(); from core.firebase_auth import initialize_firebase; initialize_firebase(); print('firebase_admin_initialized')"
```

Ket qua:

```text
firebase_admin_initialized
```

Da chay Django system check:

```bash
python backend/manage.py check
```

Ket qua:

```text
System check identified no issues (0 silenced).
```

## Ghi chu
- Firebase Admin SDK chi duoc khoi tao khi request co Bearer token hoac khi goi truc tiep `initialize_firebase()`.
- Backend hien da san sang verify Firebase ID token bang file `backend/core/firebase-credentials.json`.
