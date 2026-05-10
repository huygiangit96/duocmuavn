# Generated manually for Vietnamese two-level administrative units.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Province",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=20, unique=True)),
                ("name", models.CharField(max_length=150)),
            ],
            options={
                "ordering": ["code"],
            },
        ),
        migrations.RenameField(
            model_name="address",
            old_name="ward",
            new_name="commune",
        ),
        migrations.RemoveField(
            model_name="address",
            name="district",
        ),
        migrations.CreateModel(
            name="Commune",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=20, unique=True)),
                ("name", models.CharField(max_length=150)),
                (
                    "province",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="communes",
                        to="accounts.province",
                    ),
                ),
            ],
            options={
                "ordering": ["province__code", "code"],
            },
        ),
    ]
