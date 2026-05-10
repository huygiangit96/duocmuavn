import django_filters
from django.db.models import Q

from .models import Document


class DocumentFilter(django_filters.FilterSet):
    doc_type = django_filters.CharFilter(field_name="doc_type")
    category = django_filters.CharFilter(field_name="category__slug")
    plants = django_filters.CharFilter(method="filter_plants")
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Document
        fields = ("doc_type", "category", "plants", "search")

    def filter_plants(self, queryset, name, value):
        slugs = [slug.strip() for slug in value.split(",") if slug.strip()]
        if not slugs:
            return queryset
        return queryset.filter(plants__slug__in=slugs).distinct()

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value)
            | Q(slug__icontains=value)
            | Q(summary__icontains=value)
            | Q(content__icontains=value)
        )
