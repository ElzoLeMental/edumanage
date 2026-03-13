from django.contrib import admin
from .models import Classe, Enseignant, Eleve, ParentEleve, Note, Finance, EmploiDuTemps


@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ("nom", "effectif", "salle", "emploi_statut")
    search_fields = ("nom",)


@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ("__str__", "matiere", "contrat", "heures_semaine")
    list_filter = ("contrat",)
    filter_horizontal = ("classes",)


@admin.register(Eleve)
class EleveAdmin(admin.ModelAdmin):
    list_display = ("__str__", "classe", "statut", "frais_statut", "moyenne")
    list_filter = ("statut", "frais_statut", "classe")
    search_fields = ("user__last_name", "user__first_name")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("eleve", "matiere", "valeur", "trimestre", "date")
    list_filter = ("trimestre", "matiere")


@admin.register(Finance)
class FinanceAdmin(admin.ModelAdmin):
    list_display = ("libelle", "type", "montant", "date", "statut")
    list_filter = ("type", "statut")
    date_hierarchy = "date"


@admin.register(EmploiDuTemps)
class EmploiDuTempsAdmin(admin.ModelAdmin):
    list_display = ("jour", "heure_debut", "heure_fin", "matiere", "classe", "enseignant")
    list_filter = ("jour", "classe")
