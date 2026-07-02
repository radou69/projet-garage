# MPD — AutoGest

Modèle Physique de Données — script SQL prêt pour **MySQL / MariaDB**.
Traduction directe du MLD, avec types physiques, tailles, clés et contraintes.

```sql
-- ===========================================================
--  AutoGest — Script de création de la base de données
--  SGBD cible : MySQL / MariaDB
-- ===========================================================

CREATE DATABASE IF NOT EXISTS autogest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autogest;

-- ----------------------------------------------------------
-- UTILISATEUR (patron / employé)
-- ----------------------------------------------------------
CREATE TABLE UTILISATEUR (
    id_utilisateur  INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,
    role            ENUM('patron', 'employe') NOT NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- CLIENT
-- ----------------------------------------------------------
CREATE TABLE CLIENT (
    id_client       INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(50)  NOT NULL,
    prenom          VARCHAR(50)  NOT NULL,
    telephone       VARCHAR(20),
    email           VARCHAR(100),
    adresse         VARCHAR(150),
    id_utilisateur  INT NOT NULL,
    CONSTRAINT fk_client_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR(id_utilisateur)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- VEHICULE (véhicule du client, réparé au garage)
-- ----------------------------------------------------------
CREATE TABLE VEHICULE (
    id_vehicule     INT AUTO_INCREMENT PRIMARY KEY,
    marque          VARCHAR(50) NOT NULL,
    modele          VARCHAR(50) NOT NULL,
    immatriculation VARCHAR(15) NOT NULL UNIQUE,
    annee           SMALLINT,
    kilometrage     INT,
    id_client       INT NOT NULL UNIQUE,
    CONSTRAINT fk_vehicule_client
        FOREIGN KEY (id_client) REFERENCES CLIENT(id_client)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- RENDEZ_VOUS
-- ----------------------------------------------------------
CREATE TABLE RENDEZ_VOUS (
    id_rdv          INT AUTO_INCREMENT PRIMARY KEY,
    date_heure      DATETIME NOT NULL,
    description     VARCHAR(255),
    statut          ENUM('en_attente', 'confirme', 'annule') NOT NULL DEFAULT 'en_attente',
    id_client       INT NOT NULL,
    CONSTRAINT fk_rdv_client
        FOREIGN KEY (id_client) REFERENCES CLIENT(id_client)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- REPARATION
-- ----------------------------------------------------------
CREATE TABLE REPARATION (
    id_reparation   INT AUTO_INCREMENT PRIMARY KEY,
    date            DATE NOT NULL,
    description     VARCHAR(255),
    statut          ENUM('en_cours', 'termine') NOT NULL DEFAULT 'en_cours',
    cout_total      DECIMAL(10,2) DEFAULT 0.00,
    id_vehicule     INT NOT NULL,
    CONSTRAINT fk_reparation_vehicule
        FOREIGN KEY (id_vehicule) REFERENCES VEHICULE(id_vehicule)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- PIECE (catalogue des pièces détachées)
-- ----------------------------------------------------------
CREATE TABLE PIECE (
    id_piece        INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prix_unitaire   DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- REPARATION_PIECE (table de liaison n,n + attribut quantite)
-- ----------------------------------------------------------
CREATE TABLE REPARATION_PIECE (
    id_reparation   INT NOT NULL,
    id_piece        INT NOT NULL,
    quantite        INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_reparation, id_piece),
    CONSTRAINT fk_repiece_reparation
        FOREIGN KEY (id_reparation) REFERENCES REPARATION(id_reparation),
    CONSTRAINT fk_repiece_piece
        FOREIGN KEY (id_piece) REFERENCES PIECE(id_piece)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- DEVIS
-- ----------------------------------------------------------
CREATE TABLE DEVIS (
    id_devis        INT AUTO_INCREMENT PRIMARY KEY,
    date            DATE NOT NULL,
    montant_ht      DECIMAL(10,2) NOT NULL,
    montant_ttc     DECIMAL(10,2) NOT NULL,
    statut          ENUM('en_attente', 'accepte', 'refuse') NOT NULL DEFAULT 'en_attente',
    id_client       INT NOT NULL,
    CONSTRAINT fk_devis_client
        FOREIGN KEY (id_client) REFERENCES CLIENT(id_client)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- FACTURE
-- ----------------------------------------------------------
CREATE TABLE FACTURE (
    id_facture      INT AUTO_INCREMENT PRIMARY KEY,
    date            DATE NOT NULL,
    montant_ttc     DECIMAL(10,2) NOT NULL,
    montant_acompte DECIMAL(10,2) DEFAULT 0.00,
    date_acompte    DATE,
    statut          ENUM('en_attente', 'payee', 'en_retard') NOT NULL DEFAULT 'en_attente',
    id_devis        INT NOT NULL UNIQUE,
    CONSTRAINT fk_facture_devis
        FOREIGN KEY (id_devis) REFERENCES DEVIS(id_devis)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- VEHICULE_OCCASION (stock de véhicules à vendre)
-- ----------------------------------------------------------
CREATE TABLE VEHICULE_OCCASION (
    id_occasion     INT AUTO_INCREMENT PRIMARY KEY,
    marque          VARCHAR(50) NOT NULL,
    modele          VARCHAR(50) NOT NULL,
    annee           SMALLINT,
    kilometrage     INT,
    prix            DECIMAL(10,2) NOT NULL,
    statut          ENUM('disponible', 'reserve', 'vendu') NOT NULL DEFAULT 'disponible',
    id_client       INT NULL,
    CONSTRAINT fk_occasion_client
        FOREIGN KEY (id_client) REFERENCES CLIENT(id_client)
) ENGINE=InnoDB;
```

## Notes de conception (MPD)

- **ENUM** utilisés pour les statuts (`role`, `statut`...) : plus strict qu'un `VARCHAR` libre, correspond directement au système de couleurs des badges de la maquette (`en_attente` = jaune, `en_cours` = bleu, `termine/payee/accepte/disponible` = vert, `reserve` = violet, `refuse/en_retard` = rouge).
- `INT AUTO_INCREMENT` remplace le type `COUNTER` (Access) généré par Looping — c'est l'équivalent MySQL.
- `id_client` est **UNIQUE** dans `VEHICULE` (traduit le choix "1 client = 1 véhicule").
- `id_devis` est **UNIQUE** dans `FACTURE` (traduit "1 devis → 1 facture").
- `id_client` est **NULL autorisé** dans `VEHICULE_OCCASION` : un véhicule en stock n'a pas encore d'acheteur.
- `ENGINE=InnoDB` : nécessaire pour supporter les clés étrangères sous MySQL.
- Charset `utf8mb4` : gère tous les caractères (accents, emoji éventuels).

## ✅ Script testé

Ce script a été exécuté avec succès sur une instance MySQL/MariaDB réelle (les 10 tables et les 9 clés étrangères se créent sans erreur).
