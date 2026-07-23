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

*Critères d'acceptation :*
- CA1 : le nom et le prénom sont obligatoires.
- CA2 : le client est créé avec le statut actif par défaut.
- CA3 : une erreur 400 est renvoyée si le nom ou le prénom est manquant.

**US 2.2** — En tant qu'utilisateur, je veux rechercher un client par nom, prénom, téléphone ou marque de véhicule afin de le retrouver rapidement.

**US 2.3** — En tant qu'utilisateur, je veux consulter et modifier la fiche d'un client existant.

**US 2.4** — En tant que Patron, je veux archiver un client (sans le supprimer définitivement) afin de conserver l'historique tout en le sortant des listes actives.

---

## Epic 3 — Gestion des Véhicules (clients)

**US 3.1** — En tant qu'utilisateur, je veux enregistrer le véhicule d'un client (marque, modèle, immatriculation, carburant, VIN, année, kilométrage) afin de suivre son historique d'entretien.

*Critères d'acceptation :*
- CA1 : le client est obligatoire (contrairement à un véhicule d'occasion en stock).
- CA2 : une erreur 400 est renvoyée si le client est absent.
- CA3 : une erreur 404 est renvoyée si le client n'existe pas ou est inactif.

**US 3.2** — En tant qu'utilisateur, je veux rechercher un véhicule par marque, modèle, immatriculation ou nom du client.

**US 3.3** — En tant que Patron, je veux archiver un véhicule afin de le sortir des listes actives sans perdre son historique.

---

## Epic 4 — Rendez-vous

**US 4.1** — En tant qu'utilisateur, je veux planifier un rendez-vous pour un client (date/heure, description) afin d'organiser l'activité du garage.

*Critères d'acceptation :*
- CA1 : le client est obligatoire.
- CA2 : la date est obligatoire.
- CA3 : le statut est automatiquement initialisé à "planifie".
- CA4 : une erreur 400 est renvoyée si les données sont invalides.

**US 4.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'un rendez-vous (`confirme`, `termine`) afin de suivre son avancement.

**US 4.3** — En tant qu'utilisateur (Patron ou Employé), je veux annuler un rendez-vous afin de refléter un désistement — cette action reste ouverte aux deux rôles car c'est une opération courante.

**US 4.4** — En tant qu'utilisateur, je veux qu'un rendez-vous terminé ou annulé ait un statut figé afin d'éviter toute modification incohérente après coup.

---

## Epic 5 — Réparations & Pièces

**US 5.1** — En tant qu'utilisateur, je veux créer une réparation pour un véhicule (date, description) afin de suivre une intervention.

*Critères d'acceptation :*
- CA1 : le véhicule est obligatoire.
- CA2 : le statut est automatiquement initialisé à "en_attente".
- CA3 : le coût total est initialisé à 0.

**US 5.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'une réparation (`en_cours`, `terminee`) afin de suivre son avancement.

**US 5.3** — En tant que Patron, je veux être seul à pouvoir annuler une réparation, car une réparation déjà engagée peut impliquer du travail effectué et des pièces commandées.

**US 5.4** — En tant qu'utilisateur (Patron ou Employé), je veux ajouter, modifier la quantité, ou retirer une pièce sur une réparation en cours afin de constituer la liste des pièces utilisées.

*Critères d'acceptation :*
- CA1 : la pièce et la quantité sont obligatoires, la quantité doit être un entier positif.
- CA2 : une même pièce ne peut apparaître qu'une seule fois par réparation (erreur 409 sinon).
- CA3 : une erreur 400 est renvoyée si la réparation est terminée ou annulée.

**US 5.5** — En tant qu'utilisateur, je veux que le coût total de la réparation soit recalculé automatiquement (quantité × prix unitaire) à chaque ajout, modification ou suppression de pièce, afin d'avoir toujours un montant fiable sans saisie manuelle.

**US 5.6** — En tant qu'utilisateur, je veux qu'une réparation terminée ou annulée soit figée (statut et pièces) afin de préserver l'intégrité de l'historique.

---

## Epic 6 — Devis

**US 6.1** — En tant qu'utilisateur, je veux créer un devis pour un client (date) afin de préparer une proposition commerciale.

*Critères d'acceptation :*
- CA1 : le client est obligatoire.
- CA2 : le statut est automatiquement initialisé à "brouillon".
- CA3 : les montants HT et TTC sont initialisés à 0.

**US 6.2** — En tant qu'utilisateur, je veux ajouter des lignes libres au devis (désignation, quantité, prix unitaire) afin de détailler la prestation, sans dépendre du catalogue de pièces.

**US 6.3** — En tant qu'utilisateur, je veux que le montant HT du devis soit recalculé automatiquement à partir de ses lignes, et le montant TTC appliqué avec une TVA fixe de 20%, afin d'obtenir un montant fiable et conforme.

*Critères d'acceptation :*
- CA1 : montant HT = somme des (quantité × prix unitaire) de chaque ligne.
- CA2 : montant TTC = montant HT × 1,20.
- CA3 : le recalcul s'effectue après chaque ajout, modification ou suppression de ligne.

**US 6.4** — En tant qu'utilisateur, je veux faire évoluer le statut du devis (`envoye`, `accepte`, `refuse`, `expire`) afin de suivre le cycle de la proposition commerciale.

**US 6.5** — En tant que Patron, je veux archiver un devis afin de le sortir des listes actives sans le supprimer.

---

## Epic 7 — Factures

**US 7.1** — En tant que Patron, je veux transformer un devis accepté en facture afin de formaliser la vente.

*Critères d'acceptation :*
- CA1 : seul un devis au statut "accepte" peut être transformé (erreur 400 sinon).
- CA2 : un devis ne peut être transformé qu'une seule fois (erreur 409 sinon).
- CA3 : le devis doit contenir au moins une ligne (erreur 400 sinon).
- CA4 : les lignes du devis sont copiées dans la facture, le montant TTC est repris tel quel.
- CA5 : le devis d'origine est figé après la transformation.

**US 7.2** — En tant que Patron, je veux enregistrer un acompte reçu sur une facture (montant, date) afin de suivre les paiements partiels.

*Critères d'acceptation :*
- CA1 : le statut passe à "acompte" si le montant reçu est inférieur au montant total.
- CA2 : le statut passe à "payee" si le montant reçu couvre le montant total.
- CA3 : aucun acompte ne peut être enregistré sur une facture déjà payée ou annulée.

**US 7.3** — En tant que Patron, je veux annuler une facture non payée afin de refléter une vente qui n'a pas abouti — impossible sur une facture déjà réglée intégralement.

**US 7.4** — En tant qu'utilisateur, je veux consulter les lignes d'une facture, sans pouvoir les modifier, car une facture émise est un document légal figé.

**US 7.5** — En tant que Patron, je veux archiver une facture afin de la sortir des listes actives sans la supprimer.

---

## Epic 8 — Véhicules d'occasion

**US 8.1** — En tant qu'utilisateur, je veux ajouter un véhicule d'occasion au stock (marque, modèle, année, kilométrage, prix) afin de le proposer à la vente.

*Critères d'acceptation :*
- CA1 : la marque, le modèle et le prix sont obligatoires, le prix doit être positif.
- CA2 : le statut est automatiquement initialisé à "disponible", sans client associé.

**US 8.2** — En tant qu'utilisateur, je veux faire évoluer le statut d'un véhicule d'occasion vers `reserve` afin de refléter l'intérêt d'un client avant la vente définitive.

**US 8.3** — En tant que Patron, je veux marquer un véhicule d'occasion comme vendu, en désignant le client acheteur, afin de finaliser la transaction.

*Critères d'acceptation :*
- CA1 : le client acheteur est obligatoire.
- CA2 : une erreur 400 est renvoyée si le véhicule est déjà vendu.
- CA3 : le véhicule est figé après la vente (plus aucune modification ni revente possible).

---

## Bilan du projet

- Nombre d'Epics : **8**
- Nombre de User Stories : **32**
- Backend Symfony : ✔ terminé
- Authentification JWT : ✔ terminée
- Toutes les entités du MCD : ✔ implémentées
- API REST : ✔ testée (curl, bout en bout, sur chaque règle métier)
- Gestion des rôles (Patron / Employé) : ✔ validée

Cycle métier complet :

```
Client → Véhicule → Rendez-vous → Réparation (+ Pièces) → Devis → Facture
                                                              ↘
                                                    Véhicule d'occasion → Vente
```

Toutes les fonctionnalités décrites dans ce document ont été développées et testées. Elles constituent le backend complet de l'application AutoGest.

---

*Document généré le 23/07/2026 à partir du code implémenté et testé bout en bout sur toutes les entités du MCD.*
