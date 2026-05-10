import django_filters
from django.db.models import Q

from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    plants = django_filters.CharFilter(method="filter_plants")
    tag = django_filters.CharFilter(field_name="tag")
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Product
        fields = ("category", "plants", "tag", "search")

    def filter_plants(self, queryset, name, value):
        slugs = [slug.strip() for slug in value.split(",") if slug.strip()]
        if not slugs:
            return queryset
        return queryset.filter(plants__slug__in=slugs).distinct()

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(name__icontains=value)
            | Q(slug__icontains=value)
            | Q(description__icontains=value)
            | Q(usage__icontains=value)
            | Q(guide__icontains=value)
        )
