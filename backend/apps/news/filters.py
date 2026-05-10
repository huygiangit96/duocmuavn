import django_filters
from django.db.models import Q

from .models import Article


class ArticleFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    hashtag = django_filters.CharFilter(method="filter_hashtag")
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Article
        fields = ("category", "hashtag", "search")

    def filter_hashtag(self, queryset, name, value):
        tags = [tag.strip() for tag in value.split(",") if tag.strip()]
        if not tags:
            return queryset
        return queryset.filter(hashtags__name__in=tags).distinct()

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value)
            | Q(slug__icontains=value)
            | Q(summary__icontains=value)
            | Q(content__icontains=value)
        )
