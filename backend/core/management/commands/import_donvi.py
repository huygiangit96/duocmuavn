import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import Commune, Province


WORD_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
PROVINCE_HEADING_RE = re.compile(r"^(?P<code>\d{2})\.\s+(?P<name>.+)$")


class Command(BaseCommand):
    help = "Import Vietnamese two-level administrative units from a DOCX file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            required=True,
            dest="file_path",
            help="Path to the administrative-unit DOCX file.",
        )

    def handle(self, *args, **options):
        file_path = Path(options["file_path"])
        if not file_path.is_absolute():
            file_path = Path.cwd() / file_path
        if not file_path.exists():
            raise CommandError(f"File not found: {file_path}")

        province_rows, commune_rows = self.parse_docx(file_path)

        province_created = 0
        province_updated = 0
        commune_created = 0
        commune_updated = 0

        with transaction.atomic():
            for code, name in province_rows:
                _, created = Province.objects.update_or_create(
                    code=code,
                    defaults={"name": name},
                )
                if created:
                    province_created += 1
                else:
                    province_updated += 1

            province_by_code = {
                province.code: province for province in Province.objects.all()
            }

            for code, name, province_code in commune_rows:
                province = province_by_code.get(province_code)
                if province is None:
                    raise CommandError(
                        f"Province code {province_code} not found for commune {code}."
                    )
                _, created = Commune.objects.update_or_create(
                    code=code,
                    defaults={
                        "name": name,
                        "province": province,
                    },
                )
                if created:
                    commune_created += 1
                else:
                    commune_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Import completed: "
                f"provinces created={province_created}, updated={province_updated}; "
                f"communes created={commune_created}, updated={commune_updated}; "
                f"totals provinces={Province.objects.count()}, communes={Commune.objects.count()}"
            )
        )

    def parse_docx(self, file_path):
        try:
            with ZipFile(file_path) as docx:
                document_xml = docx.read("word/document.xml")
        except KeyError as exc:
            raise CommandError("Invalid DOCX: missing word/document.xml") from exc

        root = ET.fromstring(document_xml)
        body = root.find("w:body", WORD_NS)
        if body is None:
            raise CommandError("Invalid DOCX: missing document body")

        province_rows = []
        commune_rows = []
        current_province_code = None
        first_table_seen = False

        for child in body:
            tag = child.tag.split("}")[-1]
            if tag == "p":
                text = self.get_text(child)
                match = PROVINCE_HEADING_RE.match(text)
                if match:
                    current_province_code = match.group("code")
                continue

            if tag != "tbl":
                continue

            rows = self.get_table_rows(child)
            if not rows:
                continue

            if not first_table_seen:
                first_table_seen = True
                province_rows.extend(self.parse_province_table(rows))
                continue

            if current_province_code is None:
                continue

            commune_rows.extend(
                self.parse_commune_table(rows, current_province_code)
            )

        if not province_rows:
            raise CommandError("No province rows found in DOCX.")
        if not commune_rows:
            raise CommandError("No commune rows found in DOCX.")

        return province_rows, commune_rows

    def parse_province_table(self, rows):
        parsed = []
        for row in rows[1:]:
            if len(row) < 3:
                continue
            code = row[1].strip()
            name = row[2].strip()
            if code and name:
                parsed.append((code, name))
        return parsed

    def parse_commune_table(self, rows, province_code):
        parsed = []
        for row in rows[1:]:
            if len(row) < 2:
                continue
            code = row[0].strip()
            name = row[1].strip()
            if code and name:
                parsed.append((code, name, province_code))
        return parsed

    def get_table_rows(self, table_node):
        rows = []
        for tr in table_node.findall(".//w:tr", WORD_NS):
            cells = []
            for tc in tr.findall("./w:tc", WORD_NS):
                cells.append(self.get_text(tc))
            if any(cells):
                rows.append(cells)
        return rows

    def get_text(self, node):
        return "".join(
            text_node.text or ""
            for text_node in node.findall(".//w:t", WORD_NS)
        ).strip()
