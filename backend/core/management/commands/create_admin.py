from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from firebase_admin import auth

from apps.accounts.models import UserProfile
from core.firebase_auth import initialize_firebase


ADMIN_EMAIL = "admin@duocmua.vn"
ADMIN_PASSWORD = "Admin@2026"
ADMIN_NAME = "Quản Trị Viên"


class Command(BaseCommand):
    help = "Create or update the Duoc Mua Firebase/Django admin account."

    def handle(self, *args, **options):
        self.ensure_utf8_stdout()
        initialize_firebase()

        firebase_user, existed = self.get_or_create_firebase_user()

        with transaction.atomic():
            django_user = self.get_or_create_django_user(firebase_user.uid)
            django_user.username = firebase_user.uid
            django_user.email = ADMIN_EMAIL
            django_user.first_name = ADMIN_NAME
            django_user.last_name = ""
            django_user.is_staff = True
            django_user.is_superuser = True
            django_user.save(
                update_fields=[
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "is_staff",
                    "is_superuser",
                ]
            )

            profile, _ = UserProfile.objects.update_or_create(
                user=django_user,
                defaults={
                    "firebase_uid": firebase_user.uid,
                    "full_name": ADMIN_NAME,
                },
            )

            if profile.firebase_uid != firebase_user.uid:
                profile.firebase_uid = firebase_user.uid
                profile.save(update_fields=["firebase_uid"])

        if existed:
            self.stdout.write(
                self.style.WARNING("Admin đã tồn tại, đã cập nhật quyền.")
            )
        else:
            self.stdout.write(self.style.SUCCESS("Đã tạo tài khoản admin mới."))

        self.stdout.write(f"Firebase UID: {firebase_user.uid}")
        self.stdout.write(f"Email: {ADMIN_EMAIL}")
        self.stdout.write(f"Password: {ADMIN_PASSWORD}")
        self.stdout.write("is_staff: True")

    def get_or_create_firebase_user(self):
        try:
            firebase_user = auth.get_user_by_email(ADMIN_EMAIL)
            auth.update_user(
                firebase_user.uid,
                password=ADMIN_PASSWORD,
                display_name=ADMIN_NAME,
                disabled=False,
            )
            return auth.get_user(firebase_user.uid), True
        except auth.UserNotFoundError:
            return (
                auth.create_user(
                    email=ADMIN_EMAIL,
                    password=ADMIN_PASSWORD,
                    display_name=ADMIN_NAME,
                    disabled=False,
                ),
                False,
            )

    def get_or_create_django_user(self, firebase_uid):
        User = get_user_model()
        user = User.objects.filter(email=ADMIN_EMAIL).first()
        if user:
            return user

        user = User.objects.filter(username=firebase_uid).first()
        if user:
            return user

        return User.objects.create_user(
            username=firebase_uid,
            email=ADMIN_EMAIL,
            first_name=ADMIN_NAME,
        )

    def ensure_utf8_stdout(self):
        output = getattr(self.stdout, "_out", None)
        if output and hasattr(output, "reconfigure"):
            output.reconfigure(encoding="utf-8")
