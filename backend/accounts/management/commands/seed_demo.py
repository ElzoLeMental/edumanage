from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from school.models import Classe, Enseignant, Eleve, Finance, EmploiDuTemps
from datetime import date, time

User = get_user_model()


class Command(BaseCommand):
    help = "Crée les données de démonstration"

    def handle(self, *args, **options):
        self._create_users()
        self._create_classes()
        self._create_profiles()
        self._create_finances()
        self._create_emploi()
        self.stdout.write(self.style.SUCCESS("Données de démo créées avec succès !"))

    def _create_users(self):
        demo_users = [
            {"email": "i.mbaye@geschool.sn",  "first_name": "Ibrahima", "last_name": "Mbaye",  "role": "enseignant", "password": "Prof@2024"},
            {"email": "f.gueye@geschool.sn",  "first_name": "Fatou",    "last_name": "Gueye",  "role": "enseignant", "password": "Prof@2024"},
            {"email": "a.diallo@eleve.sn",    "first_name": "Aminata",  "last_name": "Diallo", "role": "eleve",      "password": "Eleve@2024"},
            {"email": "parent.ba@gmail.com",  "first_name": "Cheikh",   "last_name": "Ba",     "role": "parent",     "password": "Parent@2024"},
            {"email": "a.sow@geschool.sn",    "first_name": "Adja",     "last_name": "Sow",    "role": "comptable",  "password": "Compta@2024"},
        ]
        for data in demo_users:
            if not User.objects.filter(email=data["email"]).exists():
                u = User(
                    username=data["email"],
                    email=data["email"],
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    role=data["role"],
                )
                u.set_password(data["password"])
                u.save()
                self.stdout.write(f"  OK {data['email']}")

    def _create_classes(self):
        classes = [
            ("Terminale S1", "A101"), ("Terminale S2", "A102"),
            ("Première L1", "B201"), ("Première S1", "B202"), ("Seconde A", "C301"),
        ]
        for nom, salle in classes:
            Classe.objects.get_or_create(nom=nom, defaults={"salle": salle, "emploi_statut": "Complet"})

    def _create_profiles(self):
        # Profils enseignants
        ts1 = Classe.objects.filter(nom="Terminale S1").first()
        for email, matiere, heures in [
            ("i.mbaye@geschool.sn", "Mathématiques", 22),
            ("f.gueye@geschool.sn", "Français & Lettres", 18),
        ]:
            user = User.objects.filter(email=email).first()
            if user and not hasattr(user, "enseignant_profile"):
                prof = Enseignant.objects.create(user=user, matiere=matiere, contrat="titulaire", heures_semaine=heures)
                if ts1:
                    prof.classes.add(ts1)

        # Profil élève
        user = User.objects.filter(email="a.diallo@eleve.sn").first()
        if user and ts1 and not hasattr(user, "eleve_profile"):
            Eleve.objects.create(user=user, classe=ts1, statut="actif", frais_statut="payé")

    def _create_finances(self):
        admin = User.objects.filter(role="admin").first()
        ops = [
            ("recette", "Frais de scolarité T1", 124500, date(2024, 1, 15), "encaissé"),
            ("depense", "Salaires enseignants",   89400,  date(2024, 1, 31), "payé"),
            ("recette", "Droits d'inscription",   48200,  date(2024, 1, 5),  "encaissé"),
            ("depense", "Fournitures scolaires",  12800,  date(2024, 1, 20), "payé"),
            ("recette", "Frais cantine",          31800,  date(2024, 2, 1),  "partiel"),
        ]
        for type_, libelle, montant, dt, statut in ops:
            Finance.objects.get_or_create(
                libelle=libelle,
                defaults={"type": type_, "montant": montant, "date": dt, "statut": statut, "created_by": admin}
            )

    def _create_emploi(self):
        ts1 = Classe.objects.filter(nom="Terminale S1").first()
        prof = Enseignant.objects.filter(matiere="Mathématiques").first()
        if not ts1 or not prof:
            return
        slots = [
            ("lundi",  time(8, 0),  time(9, 0),  "Mathématiques"),
            ("mardi",  time(9, 0),  time(10, 0), "Physique"),
            ("mercredi", time(10, 0), time(11, 0), "Mathématiques"),
        ]
        for jour, debut, fin, matiere in slots:
            EmploiDuTemps.objects.get_or_create(
                jour=jour, heure_debut=debut, classe=ts1,
                defaults={"heure_fin": fin, "matiere": matiere, "enseignant": prof}
            )
