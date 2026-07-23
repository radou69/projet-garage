# Epics & User Stories — AutoGest

> Document rédigé a posteriori, sur la base du backend (API Symfony) conçu, codé et testé de bout en bout.

---

## Epic 1 — Authentification & Rôles

**US 1.1** — En tant qu'utilisateur (Patron ou Employé), je veux me connecter avec mon email et mon mot de passe afin d'accéder à l'application de façon sécurisée.
- Authentification via JWT, mot de passe hashé en bcrypt.
- Un token expiré ou invalide renvoie une erreur 401.

**US 1.2** — En tant que Patron, je veux que certaines actions sensibles (archivage, annulation de réparation/facture, vente de véhicule d'occasion, transformation d'un devis en facture, encaissement d'un acompte) soient réservées à mon rôle, afin de garder le contrôle sur les décisions à impact financier ou légal.
- Toute tentative d'un Employé sur ces actions renvoie une erreur 403.

---

## Epic 2 — Gestion des Clients

**US 2.1** — En tant qu'utilisateur, je veux créer une fiche client (nom, prénom, téléphone, email, adresse) afin d'enregistrer un nouveau client du garage.

**US 2.2** — En tant qu'utilisateur, je veux rechercher un client par nom, prénom, téléphone ou marque de véhicule afin de le retrouver rapidement.

**US 2.3** — En tant qu'utilisateur, je veux consulter et modifier la fiche d'un client existant.

**US 2.4** — En tant que Patron, je veux archiver un client (sans le supprimer définitivement) afin de conserver l'historique tout en le sortant des listes actives.

---

## Epic 3 — Gestion des Véhicules (clients)

**US 3.1** — En tant qu'utilisateur, je veux enregistrer le véhicule d'un client (marque, modèle, immatriculation, carburant, VIN, année, kilométrage) afin de suivre son historique d'entretien. Le client est obligatoire.

**US 3.2** — En tant qu'utilisateur, je veux rechercher un véhicule par marque, modèle, immatriculation ou nom du client.

**US 3.3** — En tant que Patron, je veux archiver un véhicule afin de le sortir des listes actives sans perdre son historique.

---

## Epic 4 — Rendez-vous

**US 4.1** — En tant qu'utilisateur, je veux planifier un rendez-vous pour un client (date/heure, description) afin d'organiser l'activité du garage. Le statut est initialisé à `planifie`.

**US 4.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'un rendez-vous (`confirme`, `termine`) afin de suivre son avancement.

**US 4.3** — En tant qu'utilisateur (Patron ou Employé), je veux annuler un rendez-vous afin de refléter un désistement — cette action reste ouverte aux deux rôles car c'est une opération courante.

**US 4.4** — En tant qu'utilisateur, je veux qu'un rendez-vous terminé ou annulé ait un statut figé afin d'éviter toute modification incohérente après coup.

---

## Epic 5 — Réparations & Pièces

**US 5.1** — En tant qu'utilisateur, je veux créer une réparation pour un véhicule (date, description) afin de suivre une intervention. Le statut est initialisé à `en_attente`, le coût total à 0.

**US 5.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'une réparation (`en_cours`, `terminee`) afin de suivre son avancement.

**US 5.3** — En tant que Patron, je veux être seul à pouvoir annuler une réparation, car une réparation déjà engagée peut impliquer du travail effectué et des pièces commandées.

**US 5.4** — En tant qu'utilisateur (Patron ou Employé), je veux ajouter, modifier la quantité, ou retirer une pièce sur une réparation en cours afin de constituer la liste des pièces utilisées. Une même pièce ne peut apparaître qu'une fois par réparation.

**US 5.5** — En tant qu'utilisateur, je veux que le coût total de la réparation soit recalculé automatiquement (quantité × prix unitaire) à chaque ajout, modification ou suppression de pièce, afin d'avoir toujours un montant fiable sans saisie manuelle.

**US 5.6** — En tant qu'utilisateur, je veux qu'une réparation terminée ou annulée soit figée (statut et pièces) afin de préserver l'intégrité de l'historique.

---

## Epic 6 — Devis

**US 6.1** — En tant qu'utilisateur, je veux créer un devis pour un client (date) afin de préparer une proposition commerciale. Le statut est initialisé à `brouillon` — utile lorsque les prix des pièces ou la disponibilité fournisseur ne sont pas encore confirmés.

**US 6.2** — En tant qu'utilisateur, je veux ajouter des lignes libres au devis (désignation, quantité, prix unitaire) afin de détailler la prestation, sans dépendre du catalogue de pièces.

**US 6.3** — En tant qu'utilisateur, je veux que le montant HT du devis soit recalculé automatiquement à partir de ses lignes, et le montant TTC appliqué avec une TVA fixe de 20%, afin d'obtenir un montant fiable et conforme.

**US 6.4** — En tant qu'utilisateur, je veux faire évoluer le statut du devis (`envoye`, `accepte`, `refuse`, `expire`) afin de suivre le cycle de la proposition commerciale.

**US 6.5** — En tant que Patron, je veux archiver un devis afin de le sortir des listes actives sans le supprimer.

---

## Epic 7 — Factures

**US 7.1** — En tant que Patron, je veux transformer un devis accepté en facture afin de formaliser la vente. Cette action, réservée au Patron, copie les lignes du devis, reprend son montant TTC, et fige définitivement le devis d'origine (un devis ne peut être transformé qu'une seule fois).

**US 7.2** — En tant que Patron, je veux enregistrer un acompte reçu sur une facture (montant, date) afin de suivre les paiements partiels. Le statut passe automatiquement à `acompte` si le montant est partiel, ou à `payee` si le montant couvre l'intégralité de la facture.

**US 7.3** — En tant que Patron, je veux annuler une facture non payée afin de refléter une vente qui n'a pas abouti — impossible sur une facture déjà réglée intégralement.

**US 7.4** — En tant qu'utilisateur, je veux consulter les lignes d'une facture, sans pouvoir les modifier, car une facture émise est un document légal figé.

**US 7.5** — En tant que Patron, je veux archiver une facture afin de la sortir des listes actives sans la supprimer.

---

## Epic 8 — Véhicules d'occasion

**US 8.1** — En tant qu'utilisateur, je veux ajouter un véhicule d'occasion au stock (marque, modèle, année, kilométrage, prix) afin de le proposer à la vente. Le statut est initialisé à `disponible`, sans client associé.

**US 8.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'un véhicule d'occasion vers `reserve` afin de refléter l'intérêt d'un client avant la vente définitive.

**US 8.3** — En tant que Patron, je veux marquer un véhicule d'occasion comme vendu, en désignant le client acheteur, afin de finaliser la transaction. Cette action, réservée au Patron, fige définitivement le véhicule (plus aucune modification ni revente possible).

---

*Document généré le 23/07/2026 à partir du code implémenté et testé bout en bout sur toutes les entités du MCD.*
