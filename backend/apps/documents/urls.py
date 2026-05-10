from django.urls import path

from .views import DocCategoryListView, DocumentDetailView, DocumentListView


app_name = "documents"

urlpatterns = [
    path("document-categories/", DocCategoryListView.as_view(), name="document-category-list"),
    path("documents/", DocumentListView.as_view(), name="document-list"),
    path("documents/<slug:slug>/", DocumentDetailView.as_view(), name="document-detail"),
]
