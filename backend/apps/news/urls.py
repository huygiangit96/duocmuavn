from django.urls import path

from .views import ArticleDetailView, ArticleListView, NewsCategoryListView


app_name = "news"

urlpatterns = [
    path("news-categories/", NewsCategoryListView.as_view(), name="news-category-list"),
    path("news/", ArticleListView.as_view(), name="article-list"),
    path("news/<slug:slug>/", ArticleDetailView.as_view(), name="article-detail"),
]
