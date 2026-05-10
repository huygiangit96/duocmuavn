# Generated manually to preserve existing Address text data when switching to FK.

import django.db.models.deletion
from django.db import migrations, models


def copy_address_units_to_fk(apps, schema_editor):
    Address = apps.get_model("accounts", "Address")
    Province = apps.get_model("accounts", "Province")
    Commune = apps.get_model("accounts", "Commune")

    for address in Address.objects.all().iterator():
        province_name = (address.province or "").strip()
        commune_name = (address.commune or "").strip()

        province = None
        commune = None

        if province_name:
            province = Province.objects.filter(name__iexact=province_name).first()
            if province is None:
                province = Province.objects.filter(name__icontains=province_name).first()

        if commune_name:
            commune_queryset = Commune.objects.filter(name__iexact=commune_name)
            if province is not None:
                commune_queryset = commune_queryset.filter(province=province)
            commune = commune_queryset.first()

            if commune is None:
                commune_queryset = Commune.objects.filter(name__icontains=commune_name)
                if province is not None:
                    commune_queryset = commune_queryset.filter(province=province)
                commune = commune_queryset.first()

        address.province_ref = province
        address.commune_ref = commune
        address.save(update_fields=["province_ref", "commune_ref"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_administrative_units_stage1"),
    ]

    operations = [
        migrations.AddField(
            model_name="address",
            name="province_ref",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="addresses_temp_province",
                to="accounts.province",
            ),
        ),
        migrations.AddField(
            model_name="address",
            name="commune_ref",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="addresses_temp_commune",
                to="accounts.commune",
            ),
        ),
        migrations.RunPython(copy_address_units_to_fk, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="address",
            name="province",
        ),
        migrations.RemoveField(
            model_name="address",
            name="commune",
        ),
        migrations.RenameField(
            model_name="address",
            old_name="province_ref",
            new_name="province",
        ),
        migrations.RenameField(
            model_name="address",
            old_name="commune_ref",
            new_name="commune",
        ),
        migrations.AlterField(
            model_name="address",
            name="province",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="addresses",
                to="accounts.province",
            ),
        ),
        migrations.AlterField(
            model_name="address",
            name="commune",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="addresses",
                to="accounts.commune",
            ),
        ),
    ]
