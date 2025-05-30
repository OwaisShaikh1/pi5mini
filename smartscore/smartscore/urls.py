from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("frontend.urls")),  # Serve React at /
    path("api/", include("api.urls")),
    path("dashboard/", include("frontend.urls")),
]
