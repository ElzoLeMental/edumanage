# EduManage — Plan de développement
> Positionnement : SaaS de gestion scolaire pensé pour le contexte sénégalais (et zone UEMOA), aligné sur la Stratégie Numérique pour l'Éducation 2025‑2029 du MEN Sénégal, concurrent local à Pronote pour les établissements privés et académies publiques.

---

## Vision produit

EduManage vise à devenir la référence locale de gestion de vie scolaire au Sénégal, en répondant aux réalités de terrain que les solutions françaises (Pronote, etc.) n'adressent pas :
- Connexion instable / low‑bandwidth
- Parents sans smartphone haut de gamme → notifications SMS/WhatsApp
- Calendrier scolaire sénégalais et référentiels MEN
- Hébergement souverain (données en Afrique)
- Alignement avec Planète 3.0 et les plateformes nationales du MEN

---

## Contexte stratégique

- **Budget national** : ~130 milliards FCFA alloués à EDU 2025‑2029 (connectivité, systèmes d'information, outils de gestion)
- **Formation** : +100 000 enseignants formés au numérique → base utilisateurs réceptive
- **Planète 3.0** : plateforme MEN de gouvernance numérique → s'y positionner en complément, pas en concurrent
- **Partenaires télécom actifs** : Sonatel/Orange, Huawei — opportunités d'intégration (SMS, réseau)
- **Marché actuel** : majorité des écoles gèrent encore en Excel / papier / WhatsApp

---

## Roadmap go-to-market (3 phases)

| Phase | Cible | Objectif |
|---|---|---|
| **GTM 1** | Écoles privées urbaines (Dakar, Thiès, Saint-Louis) | Valider le produit, générer revenus, construire les références |
| **GTM 2** | Partenariats institutionnels — académies pilotes | Co-construire avec le MEN sur EDU 2025-2029 |
| **GTM 3** | Interopérabilité Planète 3.0 + extension UEMOA | Devenir brique nationale + expansion régionale |

**Modèle SaaS B2B :** abonnement par établissement (paliers 0-300 / 300-1000 / 1000+ élèves) + forfait installation/formation.

---

## État actuel de l'application

### Modules fonctionnels
| Module | Statut | CRUD | API connectée |
|---|---|---|---|
| Authentification | ✅ Complet | — | ✅ |
| Gestion Utilisateurs | ✅ Complet | ✅ | ✅ |
| Élèves | ✅ Complet | ✅ | ✅ |
| Notes / Moyenne | ✅ Complet | ✅ | ✅ |
| Enseignants | ✅ Complet | ✅ | ✅ |
| Classes | ✅ Complet | ✅ | ✅ |
| Finances | ✅ Complet | ✅ + filtres + CSV | ✅ |
| Emploi du temps | ✅ Complet | ✅ + grille/liste | ✅ |
| Absences | ✅ Complet | ✅ + filtres + toggle justifiée | ✅ |
| Cahier de texte | ✅ Complet | ✅ (enseignant) / lecture (admin/élève/parent) | ✅ |
| Bulletins | ✅ Complet | Génération + PDF print | ✅ |
| Espace parent | ✅ Complet | Lecture enfants + bulletin | ✅ |
| Rapports | ❌ UI seulement | — | ❌ |
| Paramètres | ❌ UI seulement | — | ❌ |

### Système de permissions
- 5 rôles : Admin, Enseignant, Élève, Parent, Comptable
- Permissions personnalisables par utilisateur (via JSONField)
- Filtrage de la sidebar selon les permissions
- Masquage conditionnel des boutons selon le rôle

| Rôle | Permissions |
|---|---|
| Admin | users, eleves, enseignants, classes, finances, emploi, absences, **cahier** (lecture), rapports |
| Enseignant | eleves, classes, emploi, absences, **cahier** (lecture + écriture), rapports |
| Élève | emploi, **cahier** (lecture), rapports |
| Parent | mes-enfants, emploi, **cahier** (lecture), rapports |
| Comptable | finances, rapports |

---

## Phase 1 — Compléter les modules existants ✅ TERMINÉ

### 1.1 Module Classes ✅
- [x] CRUD complet (créer, modifier, supprimer)
- [x] Afficher la liste des élèves par classe
- [x] Admin uniquement pour les actions

### 1.2 Module Finances ✅
- [x] CRUD complet avec modal
- [x] Stats dynamiques depuis l'API (recettes, dépenses, solde)
- [x] Filtres type + statut
- [x] Export CSV

### 1.3 Module Emploi du temps ✅
- [x] Connecté à l'API réelle
- [x] Vue Grille + Vue Liste
- [x] CRUD créneaux (Jour, Horaire, Matière, Classe, Enseignant, Salle)
- [x] Filtre par classe

---

## Phase 2 — MVP "vie scolaire" ✅ TERMINÉ

Ces fonctionnalités forment le **MVP minimum vendable** à une école privée.

### 2.1 Système d'Absences ✅
- [x] Modèle `Absence` + migration
- [x] Endpoints CRUD `/api/absences/` avec filtres par élève/classe/date
- [x] Onglet "Absences" sidebar (admin, enseignant)
- [x] Tableau + filtres période/classe/justifiée + stats rapides
- [x] Bouton "Signaler une absence" (admin/enseignant)
- [x] Toggle justifiée/non justifiée en un clic

### 2.2 Bulletins de notes (PDF) ✅
- [x] Endpoint `GET /api/eleves/<pk>/bulletin/?trimestre=1`
- [x] Notes groupées par matière + moyenne + rang dans la classe + absences
- [x] Modal bulletin dans les Notes élève : sélecteur trimestre + tableau matières
- [x] Bouton "Télécharger PDF" (`window.print()`)
- [x] Appréciations automatiques (Très bien / Bien / Passable / Insuffisant)

### 2.3 Espace Parent ✅
- [x] Onglet "Mes enfants" visible uniquement pour le rôle Parent
- [x] Cartes enfants avec moyenne, nb absences, alertes (moyenne < 10, absences non justifiées)
- [x] Vue détail : notes + absences de l'enfant sélectionné
- [x] Génération bulletin depuis l'espace parent

### 2.4 Cahier de texte numérique ✅ *(style Pronote)*

**Backend :**
- [x] Modèle `CahierTexte` : enseignant, classe, matière, date, contenu_cours, devoirs, date_remise_devoirs
- [x] Champs Pronote : `type_travail` (Exercice/Lecture/Leçon/Exposé/Recherche/DM/Autre) + `duree_estimee` (15min → 2h+)
- [x] Migration `0005_cahiertexte_type_travail_duree.py`
- [x] Endpoints CRUD `/api/cahier/` + filtres par classe/date_debut/date_fin
- [x] Permissions backend : création/modification/suppression réservées aux **enseignants uniquement**
- [x] Lecture autorisée : enseignant (ses cours), élève (sa classe), parent (classes des enfants), admin (tous — lecture seule)

**Frontend (inspiré Pronote) :**
- [x] Onglet "Cahier de texte" dans la sidebar (visible : enseignant, élève, parent, admin)
- [x] Vue enseignant : **backbone emploi du temps** — les créneaux de la semaine sont pré-chargés, statut ✓ Renseigné / À renseigner
- [x] Cliquer sur un créneau vide → modal préremplit classe + matière + date
- [x] Barre de progression "X/Y séances renseignées cette semaine"
- [x] Formulaire : contenu du cours + nature du travail + durée estimée + description + date de remise
- [x] Onglet "Travail à faire" : devoirs triés par date de remise, badge urgence rouge si ≤ 2j, compte à rebours
- [x] Durée estimée et type affichés sur chaque devoir côté élève/parent
- [x] Admin : accès lecture seule uniquement

### 2.5 Tableau de bord amélioré ✅
- [x] Stats depuis l'API réelle (élèves, enseignants, classes, taux réussite, finances)
- [x] Top 5 élèves par moyenne (données réelles)
- [x] Alertes : élèves avec frais impayés, élèves avec moyenne < 10
- [x] Absences récentes en temps réel
- [x] Répartition frais de scolarité payé/partiel/impayé (données réelles)

---

## Phase 3 — Différenciateurs "contexte sénégalais" (Priorité haute pour GTM)

Ces fonctionnalités ne sont pas dans Pronote mais sont **critiques pour le marché local**.

### 3.1 Mode offline / low-bandwidth 🔴
**Pourquoi :** Connexion instable dans les établissements hors Dakar. Prérequis pour GTM 2 (académies publiques).

- [ ] Service Worker + cache offline (PWA)
- [ ] File de synchronisation différée pour les saisies sans connexion
- [ ] Indicateur de connectivité dans l'interface

### 3.2 Notifications multicanal parents 🟠
**Pourquoi :** Les parents n'ont pas tous un smartphone avec accès web régulier.

- [ ] Intégration API SMS (ex. Orange Sénégal, Twilio) pour absences et bulletins
- [ ] Intégration WhatsApp Business API (optionnel, via Twilio ou 360dialog)
- [ ] Paramétrage par parent : préférence canal (app / SMS / WhatsApp)

### 3.3 Localisation sénégalaise 🟠
- [ ] Calendrier scolaire sénégalais (trimestres, vacances officielles, examens BFEM/BAC)
- [ ] Référentiels officiels : matières, séries (S1, S2, L, etc.), niveaux
- [ ] Terminologie MEN (ex. "Inspection" au lieu d'"Académie")
- [ ] Support multilingue : français + wolof (interface simplifiée pour parents)

### 3.4 Reporting institutionnel (compatible MEN / Planète 3.0) 🟠
**Pourquoi :** Argument fort pour GTM 2 (académies pilotes) et crédibilité auprès du Ministère.

- [ ] Export standardisé des données (taux d'absentéisme, résultats, effectifs) au format attendu par le MEN
- [ ] Tableau de bord "Inspection" : vue agrégée multi-établissements
- [ ] API ou export compatible Planète 3.0 (à confirmer selon spécifications MEN)

### 3.5 Module Paramètres fonctionnel 🟡
- [ ] Modèle `ConfigEcole` (singleton) : nom, adresse, logo, calendrier scolaire
- [ ] Endpoint `GET/PATCH /api/config/`
- [ ] Nom de l'école affiché dans la sidebar (actuellement hardcodé)
- [ ] Configuration du seuil d'alertes (absences, notes)

---

## Phase 4 — UX / accessibilité

### 4.1 Profil Élève complet
- [ ] Page dédiée : photo, infos personnelles, classe, parents, notes, absences, paiements
- [ ] Historique des notes par trimestre avec graphique d'évolution
- [ ] Timeline des paiements mois par mois

### 4.2 Notifications in-app
- [ ] Cloche connectée à de vraies notifications (backend : modèle `Notification`)
- [ ] Badge rouge sur la cloche si non lues
- [ ] Dropdown des dernières notifications

### 4.3 Recherche globale
- [ ] Barre de recherche topbar fonctionnelle (élèves, enseignants, classes)
- [ ] Navigation directe vers l'élément depuis les résultats

### 4.4 Mode sombre
- [ ] Toggle Paramètres ou profil sidebar
- [ ] Persistance `localStorage`

### 4.5 Import en masse (CSV)
- [ ] Import élèves depuis CSV (admin uniquement)
- [ ] Import enseignants
- [ ] Rapport d'erreurs ligne par ligne

---

## Phase 5 — Optimisations techniques

### 5.1 Backend
- [ ] Pagination sur tous les endpoints liste
- [ ] Filtres avancés (django-filter) sur Élèves, Finances, Emploi, Absences
- [ ] Tests unitaires sur modèles et vues critiques
- [ ] Gestion avatars (upload & affichage)
- [ ] Variables d'environnement `.env` complètes
- [ ] Hébergement sur serveur africain (ex. AWS Cape Town, OVH Dakar si disponible) pour souveraineté des données

### 5.2 Frontend
- [ ] Gestion d'erreurs globale (toast notifications)
- [ ] Skeleton loaders pendant chargement
- [ ] Mémorisation des filtres actifs (localStorage)
- [ ] Validation formulaires côté client

### 5.3 Sécurité
- [ ] Vérification des rôles côté backend sur tous les endpoints sensibles
- [ ] Rate limiting sur `/api/auth/login/`
- [ ] Logs des actions critiques (création/suppression utilisateur, modification permissions)
- [ ] Conformité RGPD/loi sénégalaise sur les données personnelles (CDP)

---

## Récapitulatif des priorités

| Statut | Feature | Impact | Effort |
|---|---|---|---|
| ✅ Fait | Authentification + rôles + permissions | Socle | — |
| ✅ Fait | Gestion utilisateurs | Admin | — |
| ✅ Fait | Élèves + notes + bulletins PDF | MVP #1 | — |
| ✅ Fait | Enseignants + classes | MVP #2 | — |
| ✅ Fait | Emploi du temps (grille + liste) | MVP #3 | — |
| ✅ Fait | Finances (CRUD + filtres + CSV) | MVP #4 | — |
| ✅ Fait | Absences (CRUD + filtres + toggle) | MVP vendable | — |
| ✅ Fait | Cahier de texte (style Pronote) | Argument vente enseignants | — |
| ✅ Fait | Espace parent (enfants + bulletin) | Différenciateur local | — |
| ✅ Fait | Dashboard données réelles | Crédibilité produit | — |
| 🔴 Haute | Mode offline / PWA | Prérequis GTM hors Dakar | 2j |
| 🟠 Moyenne | Notifications SMS/WhatsApp parents | Parents low-tech | 2j |
| 🟠 Moyenne | Localisation sénégalaise (calendrier, séries, wolof) | Prérequis GTM 2 | 1j |
| 🟠 Moyenne | Reporting MEN / Planète 3.0 | Prérequis GTM 2 | 3j |
| 🟡 Basse | Paramètres fonctionnels (ConfigEcole) | Finition | 1j |
| 🟡 Basse | Profil élève complet (graphiques, timeline) | UX | 1j |
| 🟡 Basse | Notifications in-app (cloche) | UX | 1.5j |
| 🟡 Basse | Recherche globale topbar | UX | 0.5j |
| 🟡 Basse | Mode sombre | UX | 0.5j |
| 🟡 Basse | Import CSV (élèves, enseignants) | Onboarding | 1j |
| ⚪ Tech | Pagination + filtres avancés backend | Scalabilité | 0.5j |
| ⚪ Tech | Tests unitaires backend | Qualité | 2j |
| ⚪ Tech | Hébergement souverain Afrique | GTM 2 crédibilité | — |
| ⚪ Tech | Skeleton loaders + Toast notifications | Finition UX | 0.5j |
| ⚪ Tech | Rate limiting + logs sécurité | Sécurité | 0.5j |
