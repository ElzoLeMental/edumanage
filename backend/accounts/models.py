from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLES = [
        ("admin", "Administrateur"),
        ("enseignant", "Enseignant"),
        ("eleve", "Élève"),
        ("parent", "Parent d'élève"),
        ("comptable", "Comptable"),
    ]

    role = models.CharField(max_length=20, choices=ROLES)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    custom_permissions = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def save(self, *args, **kwargs):
        # Synchronise username avec email pour permettre la connexion par email
        if self.email and not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    @property
    def permissions_list(self):
        perms = {
            "admin":      ["users", "eleves", "enseignants", "classes", "finances", "emploi", "absences", "cahier", "rapports"],
            "enseignant": ["eleves", "classes", "emploi", "absences", "cahier", "rapports"],
            "eleve":      ["emploi", "cahier", "rapports"],
            "parent":     ["mes-enfants", "emploi", "cahier", "rapports"],
            "comptable":  ["finances", "rapports"],
        }
        if self.custom_permissions is not None:
            return self.custom_permissions
        return perms.get(self.role, [])
