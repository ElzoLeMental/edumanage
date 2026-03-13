from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("last_name",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Rôle & Profil", {"fields": ("role", "avatar")}),
    )
