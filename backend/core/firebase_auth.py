from pathlib import Path

import firebase_admin
from django.conf import settings
from django.contrib.auth import get_user_model
from firebase_admin import auth, credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


User = get_user_model()


def initialize_firebase():
    if firebase_admin._apps:
        return

    credentials_path = Path(settings.FIREBASE_CREDENTIALS_PATH)
    if not credentials_path.is_absolute():
        credentials_path = settings.BASE_DIR / credentials_path

    if not credentials_path.exists():
        raise AuthenticationFailed(
            f"Firebase credentials file not found: {credentials_path}"
        )

    cred = credentials.Certificate(str(credentials_path))
    firebase_admin.initialize_app(cred)


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None

        initialize_firebase()
        id_token = auth_header.split("Bearer ", 1)[1].strip()

        try:
            decoded = auth.verify_id_token(id_token)
        except Exception:
            raise AuthenticationFailed("Invalid Firebase token")

        uid = decoded["uid"]
        email = decoded.get("email", "")
        user, _ = User.objects.get_or_create(
            username=uid,
            defaults={
                "email": email,
                "first_name": decoded.get("name", ""),
            },
        )
        return (user, decoded)
