# MLD — AutoGest

Modèle Logique de Données de l'application AutoGest (gestion de garage).
Syntaxe : Markdown + Mermaid (`erDiagram`).

```mermaid
erDiagram
    UTILISATEUR ||--o{ CLIENT : create
    CLIENT ||--|| VEHICULE : create
    CLIENT ||--o{ RENDEZ_VOUS : create
    VEHICULE ||--o{ REPARATION : create
    CLIENT ||--o{ DEVIS : create
    DEVIS |o--|| FACTURE : create
    REPARATION ||--o{ REPARATION_PIECE : create
    PIECE ||--o{ REPARATION_PIECE : create
    CLIENT |o--o{ VEHICULE_OCCASION : create

    UTILISATEUR {
        int id_utilisateur PK
        varchar nom
        varchar email
        varchar mot_de_passe
        varchar role
    }

    CLIENT {
        int id_client PK
        varchar nom
        varchar prenom
        varchar telephone
        varchar email
        varchar adresse
        int id_utilisateur FK
    }

    VEHICULE {
        int id_vehicule PK
        varchar marque
        varchar modele
        varchar immatriculation
        int annee
        int kilometrage
        int id_client FK
    }

    RENDEZ_VOUS {
        int id_rdv PK
        datetime date_heure
        varchar description
        varchar statut
        int id_client FK
    }

    REPARATION {
        int id_reparation PK
        date date
        varchar description
        varchar statut
        decimal cout_total
        int id_vehicule FK
    }

    PIECE {
        int id_piece PK
        varchar nom
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
        varchar statut
        int id_client FK
    }

    FACTURE {
        int id_facture PK
        date date
        decimal montant_ttc
        decimal montant_acompte
        date date_acompte
        varchar statut
        int id_devis FK
    }

    VEHICULE_OCCASION {
        int id_occasion PK
        varchar marque
        varchar modele
        int annee
        int kilometrage
        decimal prix
        varchar statut
        int id_client FK
    }
```

## Notes

- **PK** = clé primaire · **FK** = clé étrangère · **PK_FK** = clé primaire composée et étrangère.
- `REPARATION_PIECE` est la **table de liaison** issue de l'association n,n entre REPARATION et PIECE (elle porte l'attribut `quantite`).
- `FACTURE` contient `montant_acompte` et `date_acompte` (gestion de l'acompte).
- Choix de conception : 1 client = 1 véhicule · 1 devis → 1 facture.
- `id_client` dans VEHICULE_OCCASION est l'acheteur (nullable : un véhicule en stock n'a pas encore d'acheteur).
