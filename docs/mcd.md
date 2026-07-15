# MCD — AutoGest

Modèle de données de l'application AutoGest (gestion de garage).

> Note : Mermaid produit un diagramme entité-association (ERD), proche du MCD Merise.
> Les cardinalités sont notées au format "patte de corbeau" (crow's foot).
> Le tableau de correspondance avec les cardinalités Merise (0,n / 1,1...) est donné plus bas.

## Diagramme

```mermaid
erDiagram
    UTILISATEUR ||--o{ CLIENT : "saisit"
    CLIENT ||--|| VEHICULE : "possède"
    CLIENT ||--o{ RENDEZ_VOUS : "concerne"
    VEHICULE ||--o{ REPARATION : "subit"
    CLIENT ||--o{ DEVIS : "demande"
    DEVIS |o--|| FACTURE : "se transforme en"
    REPARATION }o--o{ PIECE : "utilise"
    CLIENT |o--o{ VEHICULE_OCCASION : "achète"

    UTILISATEUR {
        int id_utilisateur PK
        string nom
        string email
        string mot_de_passe
        string role
    }

    CLIENT {
        int id_client PK
        string nom
        string prenom
        string telephone
        string email
        string adresse
        int id_utilisateur FK
    }

    VEHICULE {
        int id_vehicule PK
        string marque
        string modele
        string immatriculation
        int annee
        int kilometrage
        int id_client FK
    }

    RENDEZ_VOUS {
        int id_rdv PK
        datetime date_heure
        string description
        string statut
        int id_client FK
    }

    REPARATION {
        int id_reparation PK
        date date
        string description
        string statut
        decimal cout_total
        int id_vehicule FK
    }

    PIECE {
        int id_piece PK
        string nom
        decimal prix_unitaire
    }

    REPARATION_PIECE {
        int id_reparation PK_FK
        int id_piece PK_FK
        int quantite
    }

    DEVIS {
        int id_devis PK
        date date
        decimal montant_ht
        decimal montant_ttc
        string statut
        int id_client FK
    }

    FACTURE {
        int id_facture PK
        date date
        decimal montant_ttc
        string statut
        int id_devis FK
    }

    VEHICULE_OCCASION {
        int id_occasion PK
        string marque
        string modele
        int annee
        int kilometrage
        decimal prix
        string statut
        int id_client FK
    }
```

## Correspondance des cardinalités (Merise)

| Association | Entité A | Cardinalité A | Cardinalité B | Entité B |
|---|---|---|---|---|
| saisit | UTILISATEUR | 1,n | 0,n | CLIENT |
| possède | CLIENT | 1,1 | 1,1 | VEHICULE |
| concerne | CLIENT | 1,1 | 1,n | RENDEZ_VOUS |
| subit | VEHICULE | 1,1 | 1,n | REPARATION |
| utilise (quantité) | REPARATION | 0,n | 0,n | PIECE |
| demande | CLIENT | 1,1 | 1,n | DEVIS |
| se transforme en | DEVIS | 1,1 | 0,1 | FACTURE |
| achète | CLIENT | 0,n | 0,1 | VEHICULE_OCCASION |

## Notes de conception

- **VEHICULE** (voitures des clients, qu'on répare) et **VEHICULE_OCCASION** (stock à vendre)
  sont deux entités distinctes : attributs et cycle de vie différents.
- L'association **utilise** (REPARATION ↔ PIECE) est de type plusieurs-à-plusieurs et porte
  un attribut (quantité). En MLD elle devient la table de liaison **REPARATION_PIECE**.
- Choix retenu : **1 client = 1 véhicule** (relation simplifiée).
- Choix retenu : **1 devis → 1 facture** (lien direct).
- Le champ `role` de UTILISATEUR distingue le patron de l'employé (gestion des droits).
