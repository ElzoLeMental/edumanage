from django.db import models
from django.conf import settings


class Classe(models.Model):
    EMPLOI_CHOICES = [("Complet", "Complet"), ("Partiel", "Partiel")]

    nom = models.CharField(max_length=50)
    effectif_max = models.IntegerField(default=45)
    salle = models.CharField(max_length=20, blank=True)
    emploi_statut = models.CharField(max_length=10, choices=EMPLOI_CHOICES, default="Partiel")

    class Meta:
        verbose_name = "Classe"
        ordering = ["nom"]

    def __str__(self):
        return self.nom

    @property
    def effectif(self):
        return self.eleves.filter(statut="actif").count()


class Enseignant(models.Model):
    CONTRAT_CHOICES = [("titulaire", "Titulaire"), ("vacataire", "Vacataire")]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enseignant_profile"
    )
    matiere = models.CharField(max_length=100)
    contrat = models.CharField(max_length=20, choices=CONTRAT_CHOICES, default="vacataire")
    heures_semaine = models.IntegerField(default=0)
    classes = models.ManyToManyField(Classe, blank=True, related_name="enseignants")

    class Meta:
        verbose_name = "Enseignant"

    def __str__(self):
        return f"Prof. {self.user.last_name} — {self.matiere}"


class Eleve(models.Model):
    STATUT_CHOICES = [("actif", "Actif"), ("suspendu", "Suspendu"), ("inactif", "Inactif")]
    FRAIS_CHOICES = [("payé", "Payé"), ("partiel", "Partiel"), ("impayé", "Impayé")]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="eleve_profile"
    )
    classe = models.ForeignKey(Classe, on_delete=models.SET_NULL, null=True, blank=True, related_name="eleves")
    date_naissance = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="actif")
    frais_statut = models.CharField(max_length=10, choices=FRAIS_CHOICES, default="impayé")
    mois_payes = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Élève"
        verbose_name_plural = "Élèves"

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.classe}"

    @property
    def moyenne(self):
        notes = self.notes.all()
        if not notes:
            return None
        return round(sum(n.valeur for n in notes) / len(notes), 2)


class ParentEleve(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="parent_profile"
    )
    enfants = models.ManyToManyField(Eleve, blank=True, related_name="parents")

    class Meta:
        verbose_name = "Parent d'élève"
        verbose_name_plural = "Parents d'élèves"

    def __str__(self):
        return f"Parent: {self.user.get_full_name()}"


class Note(models.Model):
    TRIMESTRE_CHOICES = [(1, "Trimestre 1"), (2, "Trimestre 2"), (3, "Trimestre 3")]

    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name="notes")
    matiere = models.CharField(max_length=100)
    valeur = models.DecimalField(max_digits=4, decimal_places=2)
    trimestre = models.IntegerField(choices=TRIMESTRE_CHOICES)
    date = models.DateField(auto_now_add=True)
    commentaire = models.TextField(blank=True)

    class Meta:
        verbose_name = "Note"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.eleve} — {self.matiere}: {self.valeur}/20"


class Finance(models.Model):
    TYPE_CHOICES = [("recette", "Recette"), ("depense", "Dépense")]
    STATUT_CHOICES = [
        ("encaissé", "Encaissé"), ("payé", "Payé"),
        ("partiel", "Partiel"), ("en attente", "En attente"),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    libelle = models.CharField(max_length=200)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = "Opération financière"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.libelle} — {self.montant} FCFA"


class Absence(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name="absences")
    date = models.DateField()
    matiere = models.CharField(max_length=100, blank=True)
    justifiee = models.BooleanField(default=False)
    commentaire = models.TextField(blank=True)
    saisie_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = "Absence"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.eleve} — {self.date}"


class CahierTexte(models.Model):
    TYPE_TRAVAIL_CHOICES = [
        ("exercice", "Exercice"),
        ("lecture", "Lecture"),
        ("lecon", "Leçon à apprendre"),
        ("expose", "Exposé"),
        ("recherche", "Recherche"),
        ("dm", "Devoir maison"),
        ("autre", "Autre"),
    ]
    DUREE_CHOICES = [
        ("15min", "15 min"), ("30min", "30 min"), ("45min", "45 min"),
        ("1h", "1 h"), ("1h30", "1 h 30"), ("2h", "2 h"), ("2h+", "Plus de 2 h"),
    ]

    enseignant = models.ForeignKey(
        Enseignant, on_delete=models.CASCADE, related_name="cahier_texte"
    )
    classe = models.ForeignKey(
        Classe, on_delete=models.CASCADE, related_name="cahier_texte"
    )
    matiere = models.CharField(max_length=100)
    date = models.DateField()
    contenu_cours = models.TextField(blank=True)
    devoirs = models.TextField(blank=True)
    type_travail = models.CharField(max_length=20, choices=TYPE_TRAVAIL_CHOICES, blank=True)
    duree_estimee = models.CharField(max_length=10, choices=DUREE_CHOICES, blank=True)
    date_remise_devoirs = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Cahier de texte"
        verbose_name_plural = "Cahiers de texte"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.date} — {self.matiere} ({self.classe})"


class EmploiDuTemps(models.Model):
    JOURS = [
        ("lundi", "Lundi"), ("mardi", "Mardi"), ("mercredi", "Mercredi"),
        ("jeudi", "Jeudi"), ("vendredi", "Vendredi"),
    ]

    jour = models.CharField(max_length=10, choices=JOURS)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    matiere = models.CharField(max_length=100)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name="emploi_du_temps")
    enseignant = models.ForeignKey(Enseignant, on_delete=models.SET_NULL, null=True, blank=True)
    salle = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Emploi du temps"
        verbose_name_plural = "Emplois du temps"
        ordering = ["jour", "heure_debut"]

    def __str__(self):
        return f"{self.get_jour_display()} {self.heure_debut}-{self.heure_fin} — {self.matiere} ({self.classe})"
