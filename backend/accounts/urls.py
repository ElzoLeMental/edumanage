from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, me, UserListCreateView, UserDetailView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", me, name="me"),
    path("users/", UserListCreateView.as_view(), name="users"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
]
