from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum

from .models import Classe, Enseignant, Eleve, Note, Finance, EmploiDuTemps, Absence, CahierTexte
from .serializers import (
    ClasseSerializer, EnseignantSerializer,
    EleveSerializer, EleveListSerializer,
    NoteSerializer, FinanceSerializer, EmploiDuTempsSerializer,
    AbsenceSerializer, CahierTexteSerializer,
)


def _require_role(request, *roles):
    if request.user.role not in roles:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Accès refusé pour votre rôle.")


# ─── DASHBOARD ────────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    finances = Finance.objects.all()
    revenus = finances.filter(type="recette").aggregate(t=Sum("montant"))["t"] or 0
    depenses = finances.filter(type="depense").aggregate(t=Sum("montant"))["t"] or 0

    stats = {
        "eleves": Eleve.objects.filter(statut="actif").count(),
        "enseignants": Enseignant.objects.count(),
        "classes": Classe.objects.count(),
        "revenus": float(revenus),
        "depenses": float(depenses),
        "taux_reussite": _calcul_taux_reussite(),
    }
    return Response(stats)


def _calcul_taux_reussite():
    eleves = Eleve.objects.prefetch_related("notes").filter(statut="actif")
    if not eleves:
        return 0
    reussis = sum(1 for e in eleves if e.moyenne and e.moyenne >= 10)
    return round((reussis / len(eleves)) * 100, 1)


# ─── CLASSES ──────────────────────────────────────────────────────────────────
class ClasseListCreateView(generics.ListCreateAPIView):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        _require_role(self.request, "admin")
        serializer.save()


class ClasseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [IsAuthenticated]


# ─── ENSEIGNANTS ──────────────────────────────────────────────────────────────
class EnseignantListCreateView(generics.ListCreateAPIView):
    queryset = Enseignant.objects.select_related("user").prefetch_related("classes")
    serializer_class = EnseignantSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        _require_role(self.request, "admin")
        serializer.save()


class EnseignantDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enseignant.objects.select_related("user").prefetch_related("classes")
    serializer_class = EnseignantSerializer
    permission_classes = [IsAuthenticated]


# ─── ÉLÈVES ───────────────────────────────────────────────────────────────────
class EleveListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "eleve":
            return Eleve.objects.filter(user=user)
        if user.role == "parent":
            return Eleve.objects.filter(parents__user=user)
        return Eleve.objects.select_related("user", "classe").all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EleveListSerializer
        return EleveSerializer

    def perform_create(self, serializer):
        _require_role(self.request, "admin")
        serializer.save()


class EleveDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Eleve.objects.select_related("user", "classe").prefetch_related("notes")
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]


# ─── NOTES ────────────────────────────────────────────────────────────────────
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(eleve_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        eleve = generics.get_object_or_404(Eleve, pk=self.kwargs["pk"])
        serializer.save(eleve=eleve)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]


# ─── FINANCES ─────────────────────────────────────────────────────────────────
class FinanceListCreateView(generics.ListCreateAPIView):
    queryset = Finance.objects.all()
    serializer_class = FinanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        _require_role(self.request, "admin", "comptable")
        return super().get_queryset()

    def perform_create(self, serializer):
        _require_role(self.request, "admin", "comptable")
        serializer.save(created_by=self.request.user)


class FinanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Finance.objects.all()
    serializer_class = FinanceSerializer
    permission_classes = [IsAuthenticated]


# ─── EMPLOI DU TEMPS ──────────────────────────────────────────────────────────
class EmploiListCreateView(generics.ListCreateAPIView):
    serializer_class = EmploiDuTempsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = EmploiDuTemps.objects.select_related("classe", "enseignant__user")
        if user.role == "enseignant":
            try:
                qs = qs.filter(enseignant=user.enseignant_profile)
            except Enseignant.DoesNotExist:
                return qs.none()
        elif user.role == "eleve":
            try:
                qs = qs.filter(classe=user.eleve_profile.classe)
            except Eleve.DoesNotExist:
                return qs.none()
        return qs

    def perform_create(self, serializer):
        _require_role(self.request, "admin")
        serializer.save()


class EmploiDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EmploiDuTemps.objects.all()
    serializer_class = EmploiDuTempsSerializer
    permission_classes = [IsAuthenticated]


# ─── ABSENCES ─────────────────────────────────────────────────────────────────
class AbsenceListCreateView(generics.ListCreateAPIView):
    serializer_class = AbsenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Absence.objects.select_related("eleve__user", "eleve__classe")

        if user.role == "eleve":
            try:
                qs = qs.filter(eleve=user.eleve_profile)
            except Eleve.DoesNotExist:
                return qs.none()
        elif user.role == "parent":
            qs = qs.filter(eleve__parents__user=user)

        eleve_id = self.request.query_params.get("eleve")
        classe_id = self.request.query_params.get("classe")
        date = self.request.query_params.get("date")

        if eleve_id:
            qs = qs.filter(eleve_id=eleve_id)
        if classe_id:
            qs = qs.filter(eleve__classe_id=classe_id)
        if date:
            qs = qs.filter(date=date)

        return qs

    def perform_create(self, serializer):
        _require_role(self.request, "admin", "enseignant")
        serializer.save(saisie_par=self.request.user)


class AbsenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Absence.objects.select_related("eleve__user", "eleve__classe")
    serializer_class = AbsenceSerializer
    permission_classes = [IsAuthenticated]


# ─── CAHIER DE TEXTE ──────────────────────────────────────────────────────────
class CahierTexteListCreateView(generics.ListCreateAPIView):
    serializer_class = CahierTexteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CahierTexte.objects.select_related("enseignant__user", "classe")

        if user.role == "enseignant":
            try:
                qs = qs.filter(enseignant=user.enseignant_profile)
            except Enseignant.DoesNotExist:
                return qs.none()
        elif user.role == "eleve":
            try:
                qs = qs.filter(classe=user.eleve_profile.classe)
            except Eleve.DoesNotExist:
                return qs.none()
        elif user.role == "parent":
            try:
                enfants = user.parent_profile.enfants.all()
                classes = Classe.objects.filter(eleves__in=enfants)
                qs = qs.filter(classe__in=classes)
            except Exception:
                return qs.none()

        classe_id = self.request.query_params.get("classe")
        date_debut = self.request.query_params.get("date_debut")
        date_fin = self.request.query_params.get("date_fin")

        if classe_id:
            qs = qs.filter(classe_id=classe_id)
        if date_debut:
            qs = qs.filter(date__gte=date_debut)
        if date_fin:
            qs = qs.filter(date__lte=date_fin)

        return qs

    def perform_create(self, serializer):
        _require_role(self.request, "enseignant")
        try:
            serializer.save(enseignant=self.request.user.enseignant_profile)
        except Enseignant.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Profil enseignant introuvable.")


class CahierTexteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CahierTexte.objects.select_related("enseignant__user", "classe")
    serializer_class = CahierTexteSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        _require_role(self.request, "enseignant")
        serializer.save()

    def perform_destroy(self, instance):
        _require_role(self.request, "enseignant")
        instance.delete()


# ─── BULLETIN ─────────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bulletin_eleve(request, pk):
    eleve = generics.get_object_or_404(Eleve, pk=pk)
    trimestre = request.query_params.get("trimestre")

    notes_qs = eleve.notes.all()
    if trimestre:
        notes_qs = notes_qs.filter(trimestre=trimestre)

    # Grouper par matière
    matieres = {}
    for note in notes_qs:
        if note.matiere not in matieres:
            matieres[note.matiere] = []
        matieres[note.matiere].append({
            "id": note.id,
            "valeur": float(note.valeur),
            "commentaire": note.commentaire,
            "trimestre": note.trimestre,
            "date": str(note.date),
        })

    matieres_summary = []
    for matiere, notes in matieres.items():
        valeurs = [n["valeur"] for n in notes]
        matieres_summary.append({
            "matiere": matiere,
            "notes": notes,
            "moyenne": round(sum(valeurs) / len(valeurs), 2),
        })
    matieres_summary.sort(key=lambda x: x["matiere"])

    # Moyenne générale
    toutes_valeurs = [n["valeur"] for m in matieres_summary for n in m["notes"]]
    moyenne_generale = round(sum(toutes_valeurs) / len(toutes_valeurs), 2) if toutes_valeurs else None

    # Rang dans la classe
    rang = None
    if eleve.classe:
        camarades = Eleve.objects.filter(classe=eleve.classe, statut="actif").prefetch_related("notes")
        if trimestre:
            moyennes = []
            for c in camarades:
                ns = [float(n.valeur) for n in c.notes.filter(trimestre=trimestre)]
                if ns:
                    moyennes.append((c.id, sum(ns) / len(ns)))
        else:
            moyennes = [(c.id, float(c.moyenne)) for c in camarades if c.moyenne is not None]
        moyennes.sort(key=lambda x: x[1], reverse=True)
        rang_map = {cid: i + 1 for i, (cid, _) in enumerate(moyennes)}
        rang = rang_map.get(eleve.id)

    absences_count = eleve.absences.count()
    absences_justifiees = eleve.absences.filter(justifiee=True).count()

    return Response({
        "eleve": {
            "id": eleve.id,
            "nom": eleve.user.last_name,
            "prenom": eleve.user.first_name,
            "classe": eleve.classe.nom if eleve.classe else None,
        },
        "trimestre": trimestre,
        "matieres": matieres_summary,
        "moyenne_generale": moyenne_generale,
        "rang": rang,
        "total_eleves_classe": len(moyennes) if eleve.classe else None,
        "absences_total": absences_count,
        "absences_justifiees": absences_justifiees,
    })
