 Epics & User Stories — AutoGest

Epic 1 (MVP) : Authentification & Gestion des rôles
User Story 1.1 : En tant que patron, je veux me connecter afin d'accéder à mon espace de gestion du garage.
- CA 1 : L'utilisateur peut saisir un email et un mot de passe
- CA 2 : Le mot de passe est hashé (bcrypt)
- CA 3 : Un token JWT est généré à la connexion
- CA 4 : Si les identifiants sont incorrects, un message d'erreur s'affiche
User Story 1.2 : En tant que patron, je veux créer un compte employé afin que mon mécanicien puisse accéder à l'application.
- CA 1 : Le patron peut créer un compte avec nom, email, mot de passe
- CA 2 : Le rôle "employé" est automatiquement assigné
- CA 3 : L'employé ne peut pas créer d'autres comptes
User Story 1.3 : En tant qu'utilisateur, je veux me déconnecter afin de sécuriser ma session.
- CA 1 : Le token JWT est supprimé à la déconnexion
- CA 2 : L'utilisateur est redirigé vers la page de connexion

Epic 2 (MVP) : Gestion des clients
User Story 2.1 : En tant que patron ou employé, je veux créer une fiche client afin d'enregistrer ses informations.
- CA 1 : Saisir nom, prénom, téléphone, email, adresse
- CA 2 : La fiche est sauvegardée en base de données
- CA 3 : Un message de confirmation s'affiche
User Story 2.2 : En tant que patron ou employé, je veux rechercher un client afin de retrouver rapidement sa fiche.
- CA 1 : Recherche par nom ou téléphone ou par marque du véhicule
- CA 2 : Les résultats s'affichent en temps réel 
- CA 3 : On peut cliquer sur un résultat pour voir la fiche complète
User Story 2.3 : En tant que patron ou employé, je veux modifier la fiche d'un client afin de mettre à jour ses informations.
- CA 1 : Tous les champs sont modifiables
- CA 2 : Les modifications sont sauvegardées en base de données

Epic 3 (MVP) : Gestion des rendez-vous
User Story 3.1 : En tant que patron ou employé, je veux créer un rendez-vous afin d'organiser le planning de l'atelier.
- CA 1 : Sélectionner un client existant
- CA 2 : Choisir une date et une heure
- CA 3 : Ajouter une description de l'intervention
- CA 4 : Le RDV apparaît dans le planning
User Story 3.2 : En tant que patron ou employé, je veux voir le planning du jour afin de connaître les interventions prévues.
- CA 1 : Affichage des RDV du jour par ordre chronologique
- CA 2 : Chaque RDV affiche le client, l'heure et la description
- CA 3 : L'interface est utilisable sur mobile
User Story 3.3 : En tant que patron ou employé, je veux modifier ou annuler un RDV afin de gérer les imprévus.
- CA 1 : On peut modifier la date, l'heure ou la description
- CA 2 : On peut supprimer un RDV
- CA 3 : Une confirmation est demandée avant suppression

Epic 4 (MVP) : Gestion des réparations & pièces
User Story 4.1 : En tant que patron ou employé, je veux créer une fiche de réparation afin de suivre les travaux effectués.
- CA 1 : Lier la réparation à un client et un véhicule
- CA 2 : Décrire les travaux effectués
- CA 3 : Ajouter les pièces utilisées avec leur prix
- CA 4 : Le statut de la réparation est visible (en cours / terminé)
User Story 4.2 : En tant que patron ou employé, je veux ajouter des pièces détachées à une réparation afin de calculer le coût total.
- CA 1 : Saisir le nom, la quantité et le prix unitaire de chaque pièce
- CA 2 : Le total des pièces est calculé automatiquement 

Epic 5 (MVP) : Devis & Factures
User Story 5.1 : En tant que patron, je veux créer un devis afin de proposer un prix au client avant intervention.
- CA 1 : Lier le devis à un client
- CA 2 : Ajouter les prestations et pièces avec leurs prix (inclut la main d'œuvre)
- CA 3 : Le total HT et TTC est calculé automatiquement
- CA 4 : Le devis est téléchargeable en PDF
User Story 5.2 : En tant que patron, je veux transformer un devis accepté en facture afin de facturer le client.
- CA 1 : Un bouton "Transformer en facture" est disponible
- CA 2 : La facture reprend toutes les informations du devis
- CA 3 : La facture est téléchargeable en PDF
User Story 5.3 : En tant que patron, je veux consulter la liste des factures afin de suivre mes encaissements.
- CA 1 : Liste des factures avec statut (payée / en attente)
- CA 2 : Filtrer par date ou par client
- CA 3 : Accès réservé au patron uniquement

Epic 6 (non MVP) : Vente de véhicules
User Story 6.1 : En tant que patron, je veux ajouter un véhicule à vendre afin de gérer mon stock d'occasion.
- CA 1 : Saisir marque, modèle, année, kilométrage, prix
- CA 2 : Ajouter des photos du véhicule
- CA 3 : Le véhicule apparaît dans la liste des véhicules disponibles
User Story 6.2 : En tant que patron, je veux marquer un véhicule comme vendu afin de mettre à jour mon stock.
- CA 1 : Changer le statut en "vendu"
- CA 2 : Le véhicule n'apparaît plus dans les disponibles
- CA 3 : Lier la vente à un client