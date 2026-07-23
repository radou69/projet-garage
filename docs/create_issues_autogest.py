import os
import urllib.request
import json

# Le token n'est jamais écrit en dur ici : on le lit depuis une variable d'environnement.
# Avant de lancer ce script, dans le même terminal :
#   export GITHUB_TOKEN="ton_token_ici"
#   python3 create_issues_autogest.py
TOKEN = os.environ.get("GITHUB_TOKEN")
REPO = "radou69/projet-garage"

if not TOKEN:
    print("Erreur : la variable d'environnement GITHUB_TOKEN n'est pas définie.")
    print('Lance d\'abord : export GITHUB_TOKEN="ton_token_ici"')
    raise SystemExit(1)

issues = [
    # --- Epic 1 : Authentification & Rôles ---
    {"title": "[Epic 1] US1.1 - Connexion sécurisée", "body": "**En tant qu'utilisateur (Patron ou Employé)**, je veux me connecter avec mon email et mon mot de passe afin d'accéder à l'application de façon sécurisée.\n\n## Critères d'acceptation\n- CA1 : authentification via JWT, mot de passe hashé en bcrypt\n- CA2 : un token expiré ou invalide renvoie une erreur 401"},
    {"title": "[Epic 1] US1.2 - Restriction des actions sensibles au Patron", "body": "**En tant que Patron**, je veux que certaines actions sensibles (archivage, annulation de réparation/facture, vente de véhicule d'occasion, transformation d'un devis en facture, encaissement d'un acompte) soient réservées à mon rôle, afin de garder le contrôle sur les décisions à impact financier ou légal.\n\n## Critères d'acceptation\n- CA1 : toute tentative d'un Employé sur ces actions renvoie une erreur 403"},

    # --- Epic 2 : Clients ---
    {"title": "[Epic 2] US2.1 - Créer une fiche client", "body": "**En tant qu'utilisateur**, je veux créer une fiche client (nom, prénom, téléphone, email, adresse) afin d'enregistrer un nouveau client du garage.\n\n## Critères d'acceptation\n- CA1 : le nom et le prénom sont obligatoires\n- CA2 : le client est créé avec le statut actif par défaut\n- CA3 : une erreur 400 est renvoyée si le nom ou le prénom est manquant"},
    {"title": "[Epic 2] US2.2 - Rechercher un client", "body": "**En tant qu'utilisateur**, je veux rechercher un client par nom, prénom, téléphone ou marque de véhicule afin de le retrouver rapidement."},
    {"title": "[Epic 2] US2.3 - Consulter et modifier une fiche client", "body": "**En tant qu'utilisateur**, je veux consulter et modifier la fiche d'un client existant."},
    {"title": "[Epic 2] US2.4 - Archiver un client", "body": "**En tant que Patron**, je veux archiver un client (sans le supprimer définitivement) afin de conserver l'historique tout en le sortant des listes actives."},

    # --- Epic 3 : Véhicules (clients) ---
    {"title": "[Epic 3] US3.1 - Enregistrer le véhicule d'un client", "body": "**En tant qu'utilisateur**, je veux enregistrer le véhicule d'un client (marque, modèle, immatriculation, carburant, VIN, année, kilométrage) afin de suivre son historique d'entretien.\n\n## Critères d'acceptation\n- CA1 : le client est obligatoire\n- CA2 : une erreur 400 est renvoyée si le client est absent\n- CA3 : une erreur 404 est renvoyée si le client n'existe pas ou est inactif"},
    {"title": "[Epic 3] US3.2 - Rechercher un véhicule", "body": "**En tant qu'utilisateur**, je veux rechercher un véhicule par marque, modèle, immatriculation ou nom du client."},
    {"title": "[Epic 3] US3.3 - Archiver un véhicule", "body": "**En tant que Patron**, je veux archiver un véhicule afin de le sortir des listes actives sans perdre son historique."},

    # --- Epic 4 : Rendez-vous ---
    {"title": "[Epic 4] US4.1 - Planifier un rendez-vous", "body": "**En tant qu'utilisateur**, je veux planifier un rendez-vous pour un client (date/heure, description) afin d'organiser l'activité du garage.\n\n## Critères d'acceptation\n- CA1 : le client est obligatoire\n- CA2 : la date est obligatoire\n- CA3 : le statut est automatiquement initialisé à \"planifie\"\n- CA4 : une erreur 400 est renvoyée si les données sont invalides"},
    {"title": "[Epic 4] US4.2 - Faire évoluer le statut d'un rendez-vous", "body": "**En tant qu'utilisateur**, je veux faire évoluer le statut d'un rendez-vous (confirme, termine) afin de suivre son avancement."},
    {"title": "[Epic 4] US4.3 - Annuler un rendez-vous", "body": "**En tant qu'utilisateur (Patron ou Employé)**, je veux annuler un rendez-vous afin de refléter un désistement — cette action reste ouverte aux deux rôles car c'est une opération courante."},
    {"title": "[Epic 4] US4.4 - Figer un rendez-vous terminé ou annulé", "body": "**En tant qu'utilisateur**, je veux qu'un rendez-vous terminé ou annulé ait un statut figé afin d'éviter toute modification incohérente après coup."},

    # --- Epic 5 : Réparations & Pièces ---
    {"title": "[Epic 5] US5.1 - Créer une réparation", "body": "**En tant qu'utilisateur**, je veux créer une réparation pour un véhicule (date, description) afin de suivre une intervention.\n\n## Critères d'acceptation\n- CA1 : le véhicule est obligatoire\n- CA2 : le statut est automatiquement initialisé à \"en_attente\"\n- CA3 : le coût total est initialisé à 0"},
    {"title": "[Epic 5] US5.2 - Faire évoluer le statut d'une réparation", "body": "**En tant qu'utilisateur**, je veux faire évoluer le statut d'une réparation (en_cours, terminee) afin de suivre son avancement."},
    {"title": "[Epic 5] US5.3 - Annulation de réparation réservée au Patron", "body": "**En tant que Patron**, je veux être seul à pouvoir annuler une réparation, car une réparation déjà engagée peut impliquer du travail effectué et des pièces commandées."},
    {"title": "[Epic 5] US5.4 - Gérer les pièces d'une réparation", "body": "**En tant qu'utilisateur (Patron ou Employé)**, je veux ajouter, modifier la quantité, ou retirer une pièce sur une réparation en cours afin de constituer la liste des pièces utilisées.\n\n## Critères d'acceptation\n- CA1 : la pièce et la quantité sont obligatoires, la quantité doit être un entier positif\n- CA2 : une même pièce ne peut apparaître qu'une seule fois par réparation (erreur 409 sinon)\n- CA3 : une erreur 400 est renvoyée si la réparation est terminée ou annulée"},
    {"title": "[Epic 5] US5.5 - Recalcul automatique du coût total", "body": "**En tant qu'utilisateur**, je veux que le coût total de la réparation soit recalculé automatiquement (quantité × prix unitaire) à chaque ajout, modification ou suppression de pièce, afin d'avoir toujours un montant fiable sans saisie manuelle."},
    {"title": "[Epic 5] US5.6 - Figer une réparation terminée ou annulée", "body": "**En tant qu'utilisateur**, je veux qu'une réparation terminée ou annulée soit figée (statut et pièces) afin de préserver l'intégrité de l'historique."},

    # --- Epic 6 : Devis ---
    {"title": "[Epic 6] US6.1 - Créer un devis", "body": "**En tant qu'utilisateur**, je veux créer un devis pour un client (date) afin de préparer une proposition commerciale.\n\n## Critères d'acceptation\n- CA1 : le client est obligatoire\n- CA2 : le statut est automatiquement initialisé à \"brouillon\"\n- CA3 : les montants HT et TTC sont initialisés à 0"},
    {"title": "[Epic 6] US6.2 - Ajouter des lignes libres au devis", "body": "**En tant qu'utilisateur**, je veux ajouter des lignes libres au devis (désignation, quantité, prix unitaire) afin de détailler la prestation, sans dépendre du catalogue de pièces."},
    {"title": "[Epic 6] US6.3 - Calcul automatique HT/TTC (TVA 20%)", "body": "**En tant qu'utilisateur**, je veux que le montant HT du devis soit recalculé automatiquement à partir de ses lignes, et le montant TTC appliqué avec une TVA fixe de 20%, afin d'obtenir un montant fiable et conforme.\n\n## Critères d'acceptation\n- CA1 : montant HT = somme des (quantité × prix unitaire) de chaque ligne\n- CA2 : montant TTC = montant HT × 1,20\n- CA3 : le recalcul s'effectue après chaque ajout, modification ou suppression de ligne"},
    {"title": "[Epic 6] US6.4 - Faire évoluer le statut d'un devis", "body": "**En tant qu'utilisateur**, je veux faire évoluer le statut du devis (envoye, accepte, refuse, expire) afin de suivre le cycle de la proposition commerciale."},
    {"title": "[Epic 6] US6.5 - Archiver un devis", "body": "**En tant que Patron**, je veux archiver un devis afin de le sortir des listes actives sans le supprimer."},

    # --- Epic 7 : Factures ---
    {"title": "[Epic 7] US7.1 - Transformer un devis accepté en facture", "body": "**En tant que Patron**, je veux transformer un devis accepté en facture afin de formaliser la vente.\n\n## Critères d'acceptation\n- CA1 : seul un devis au statut \"accepte\" peut être transformé (erreur 400 sinon)\n- CA2 : un devis ne peut être transformé qu'une seule fois (erreur 409 sinon)\n- CA3 : le devis doit contenir au moins une ligne (erreur 400 sinon)\n- CA4 : les lignes du devis sont copiées dans la facture, le montant TTC est repris tel quel\n- CA5 : le devis d'origine est figé après la transformation"},
    {"title": "[Epic 7] US7.2 - Enregistrer un acompte", "body": "**En tant que Patron**, je veux enregistrer un acompte reçu sur une facture (montant, date) afin de suivre les paiements partiels.\n\n## Critères d'acceptation\n- CA1 : le statut passe à \"acompte\" si le montant reçu est inférieur au montant total\n- CA2 : le statut passe à \"payee\" si le montant reçu couvre le montant total\n- CA3 : aucun acompte ne peut être enregistré sur une facture déjà payée ou annulée"},
    {"title": "[Epic 7] US7.3 - Annuler une facture non payée", "body": "**En tant que Patron**, je veux annuler une facture non payée afin de refléter une vente qui n'a pas abouti — impossible sur une facture déjà réglée intégralement."},
    {"title": "[Epic 7] US7.4 - Lignes de facture en lecture seule", "body": "**En tant qu'utilisateur**, je veux consulter les lignes d'une facture, sans pouvoir les modifier, car une facture émise est un document légal figé."},
    {"title": "[Epic 7] US7.5 - Archiver une facture", "body": "**En tant que Patron**, je veux archiver une facture afin de la sortir des listes actives sans la supprimer."},

    # --- Epic 8 : Véhicules d'occasion ---
    {"title": "[Epic 8] US8.1 - Ajouter un véhicule d'occasion au stock", "body": "**En tant qu'utilisateur**, je veux ajouter un véhicule d'occasion au stock (marque, modèle, année, kilométrage, prix) afin de le proposer à la vente.\n\n## Critères d'acceptation\n- CA1 : la marque, le modèle et le prix sont obligatoires, le prix doit être positif\n- CA2 : le statut est automatiquement initialisé à \"disponible\", sans client associé"},
    {"title": "[Epic 8] US8.2 - Réserver un véhicule d'occasion", "body": "**En tant qu'utilisateur**, je veux faire évoluer le statut d'un véhicule d'occasion vers \"reserve\" afin de refléter l'intérêt d'un client avant la vente définitive."},
    {"title": "[Epic 8] US8.3 - Vendre un véhicule d'occasion", "body": "**En tant que Patron**, je veux marquer un véhicule d'occasion comme vendu, en désignant le client acheteur, afin de finaliser la transaction.\n\n## Critères d'acceptation\n- CA1 : le client acheteur est obligatoire\n- CA2 : une erreur 400 est renvoyée si le véhicule est déjà vendu\n- CA3 : le véhicule est figé après la vente (plus aucune modification ni revente possible)"},
]

url = f"https://api.github.com/repos/{REPO}/issues"
headers = {
    "Authorization": f"token {TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/vnd.github.v3+json",
}

for issue in issues:
    data = json.dumps(issue).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            res = json.loads(r.read())
            print(f"OK #{res['number']} - {res['title']}")
    except Exception as e:
        print(f"ERREUR sur '{issue['title']}' : {e}")
