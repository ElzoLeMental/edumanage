from rest_framework import serializers
from .models import Classe, Enseignant, Eleve, ParentEleve, Note, Finance, EmploiDuTemps, Absence, CahierTexte


class ClasseSerializer(serializers.ModelSerializer):
    effectif = serializers.IntegerField(read_only=True)

    class Meta:
        model = Classe
        fields = ["id", "nom", "effectif_max", "effectif", "salle", "emploi_statut"]


class EnseignantSerializer(serializers.ModelSerializer):
    nom_complet = serializers.SerializerMethodField()
    classes_noms = serializers.SerializerMethodField()

    class Meta:
        model = Enseignant
        fields = ["id", "user", "nom_complet", "matiere", "contrat", "heures_semaine", "classes", "classes_noms"]

    def get_nom_complet(self, obj):
        return f"Prof. {obj.user.last_name}"

    def get_classes_noms(self, obj):
        return [c.nom for c in obj.classes.all()]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "matiere", "valeur", "trimestre", "date", "commentaire"]


class EleveSerializer(serializers.ModelSerializer):
    nom = serializers.SerializerMethodField()
    prenom = serializers.SerializerMethodField()
    classe_nom = serializers.SerializerMethodField()
    moyenne = serializers.DecimalField(read_only=True, max_digits=4, decimal_places=2)
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = Eleve
        fields = [
            "id", "user", "nom", "prenom", "classe", "classe_nom",
            "date_naissance", "statut", "frais_statut", "mois_payes", "moyenne", "notes",
        ]

    def get_nom(self, obj):
        return obj.user.last_name

    def get_prenom(self, obj):
        return obj.user.first_name

    def get_classe_nom(self, obj):
        return obj.classe.nom if obj.classe else None


class EleveListSerializer(serializers.ModelSerializer):
    nom = serializers.SerializerMethodField()
    prenom = serializers.SerializerMethodField()
    classe_nom = serializers.SerializerMethodField()
    moyenne = serializers.DecimalField(read_only=True, max_digits=4, decimal_places=2)

    class Meta:
        model = Eleve
        fields = ["id", "nom", "prenom", "classe", "classe_nom", "statut", "frais_statut", "mois_payes", "moyenne"]

    def get_nom(self, obj):
        return obj.user.last_name

    def get_prenom(self, obj):
        return obj.user.first_name

    def get_classe_nom(self, obj):
        return obj.classe.nom if obj.classe else None


class FinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finance
        fields = ["id", "type", "libelle", "montant", "date", "statut", "created_by"]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class EmploiDuTempsSerializer(serializers.ModelSerializer):
    classe_nom = serializers.SerializerMethodField()
    enseignant_nom = serializers.SerializerMethodField()

    class Meta:
        model = EmploiDuTemps
        fields = [
            "id", "jour", "heure_debut", "heure_fin", "matiere",
            "classe", "classe_nom", "enseignant", "enseignant_nom", "salle",
        ]

    def get_classe_nom(self, obj):
        return obj.classe.nom

    def get_enseignant_nom(self, obj):
        return str(obj.enseignant) if obj.enseignant else None


class AbsenceSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.SerializerMethodField()
    eleve_prenom = serializers.SerializerMethodField()
    classe_nom = serializers.SerializerMethodField()

    class Meta:
        model = Absence
        fields = [
            "id", "eleve", "eleve_nom", "eleve_prenom", "classe_nom",
            "date", "matiere", "justifiee", "commentaire", "saisie_par",
        ]
        read_only_fields = ["saisie_par"]

    def get_eleve_nom(self, obj):
        return obj.eleve.user.last_name

    def get_eleve_prenom(self, obj):
        return obj.eleve.user.first_name

    def get_classe_nom(self, obj):
        return obj.eleve.classe.nom if obj.eleve.classe else None

    def create(self, validated_data):
        validated_data["saisie_par"] = self.context["request"].user
        return super().create(validated_data)


class CahierTexteSerializer(serializers.ModelSerializer):
    enseignant_nom = serializers.SerializerMethodField()
    classe_nom = serializers.SerializerMethodField()
    enseignant = serializers.PrimaryKeyRelatedField(
        queryset=Enseignant.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = CahierTexte
        fields = [
            "id", "enseignant", "enseignant_nom", "classe", "classe_nom",
            "matiere", "date", "contenu_cours",
            "devoirs", "type_travail", "duree_estimee", "date_remise_devoirs",
        ]

    def get_enseignant_nom(self, obj):
        return str(obj.enseignant)

    def get_classe_nom(self, obj):
        return obj.classe.nom
