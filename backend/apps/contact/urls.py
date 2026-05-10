from django.urls import path

from .views import BannerListView, ContactSubmissionCreateView, SiteConfigView


app_name = "contact"

urlpatterns = [
    path("banners/", BannerListView.as_view(), name="banner-list"),
    path("contact/", ContactSubmissionCreateView.as_view(), name="contact-submit"),
    path("config/", SiteConfigView.as_view(), name="site-config"),
]
