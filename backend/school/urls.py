from django.urls import path
from .views import (
    dashboard_stats,
    ClasseListCreateView, ClasseDetailView,
    EnseignantListCreateView, EnseignantDetailView,
    EleveListCreateView, EleveDetailView,
    NoteListCreateView, NoteDetailView,
    FinanceListCreateView, FinanceDetailView,
    EmploiListCreateView, EmploiDetailView,
    AbsenceListCreateView, AbsenceDetailView,
    CahierTexteListCreateView, CahierTexteDetailView,
    bulletin_eleve,
)

urlpatterns = [
    path("dashboard/", dashboard_stats, name="dashboard"),
    path("classes/", ClasseListCreateView.as_view(), name="classes"),
    path("classes/<int:pk>/", ClasseDetailView.as_view(), name="classe_detail"),
    path("enseignants/", EnseignantListCreateView.as_view(), name="enseignants"),
    path("enseignants/<int:pk>/", EnseignantDetailView.as_view(), name="enseignant_detail"),
    path("eleves/", EleveListCreateView.as_view(), name="eleves"),
    path("eleves/<int:pk>/", EleveDetailView.as_view(), name="eleve_detail"),
    path("eleves/<int:pk>/notes/", NoteListCreateView.as_view(), name="eleve_notes"),
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note_detail"),
    path("finances/", FinanceListCreateView.as_view(), name="finances"),
    path("finances/<int:pk>/", FinanceDetailView.as_view(), name="finance_detail"),
    path("emploi-du-temps/", EmploiListCreateView.as_view(), name="emploi"),
    path("emploi-du-temps/<int:pk>/", EmploiDetailView.as_view(), name="emploi_detail"),
    path("absences/", AbsenceListCreateView.as_view(), name="absences"),
    path("absences/<int:pk>/", AbsenceDetailView.as_view(), name="absence_detail"),
    path("cahier/", CahierTexteListCreateView.as_view(), name="cahier"),
    path("cahier/<int:pk>/", CahierTexteDetailView.as_view(), name="cahier_detail"),
    path("eleves/<int:pk>/bulletin/", bulletin_eleve, name="bulletin_eleve"),
]
