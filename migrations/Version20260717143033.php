<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260717143033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE client (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(50) NOT NULL, prenom VARCHAR(50) NOT NULL, telephone VARCHAR(20) DEFAULT NULL, email VARCHAR(100) DEFAULT NULL, adresse VARCHAR(150) DEFAULT NULL, actif BOOLEAN DEFAULT 1 NOT NULL, utilisateur_id INTEGER NOT NULL, CONSTRAINT FK_C7440455FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_C7440455FB88E14F ON client (utilisateur_id)');
        $this->addSql('CREATE TABLE devis (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date DATE NOT NULL, montant_ht NUMERIC(10, 2) NOT NULL, montant_ttc NUMERIC(10, 2) NOT NULL, statut VARCHAR(20) NOT NULL, actif BOOLEAN DEFAULT 1 NOT NULL, client_id INTEGER NOT NULL, CONSTRAINT FK_8B27C52B19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_8B27C52B19EB6921 ON devis (client_id)');
        $this->addSql('CREATE TABLE devis_item (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, designation VARCHAR(150) NOT NULL, quantite INTEGER NOT NULL, prix_unitaire NUMERIC(10, 2) NOT NULL, montant NUMERIC(10, 2) NOT NULL, devis_id INTEGER NOT NULL, CONSTRAINT FK_50C944C141DEFADA FOREIGN KEY (devis_id) REFERENCES devis (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_50C944C141DEFADA ON devis_item (devis_id)');
        $this->addSql('CREATE TABLE facture (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date DATE NOT NULL, montant_ttc NUMERIC(10, 2) NOT NULL, montant_acompte NUMERIC(10, 2) DEFAULT NULL, date_acompte DATE DEFAULT NULL, statut VARCHAR(20) NOT NULL, devis_id INTEGER NOT NULL, client_id INTEGER NOT NULL, CONSTRAINT FK_FE86641041DEFADA FOREIGN KEY (devis_id) REFERENCES devis (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_FE86641019EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FE86641041DEFADA ON facture (devis_id)');
        $this->addSql('CREATE INDEX IDX_FE86641019EB6921 ON facture (client_id)');
        $this->addSql('CREATE TABLE facture_item (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, designation VARCHAR(150) NOT NULL, quantite INTEGER NOT NULL, prix_unitaire NUMERIC(10, 2) NOT NULL, montant NUMERIC(10, 2) NOT NULL, facture_id INTEGER NOT NULL, CONSTRAINT FK_F91D09D27F2DEE08 FOREIGN KEY (facture_id) REFERENCES facture (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F91D09D27F2DEE08 ON facture_item (facture_id)');
        $this->addSql('CREATE TABLE piece (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prix_unitaire NUMERIC(10, 2) NOT NULL)');
        $this->addSql('CREATE TABLE rendez_vous (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date_heure DATETIME NOT NULL, description VARCHAR(255) DEFAULT NULL, statut VARCHAR(20) NOT NULL, client_id INTEGER NOT NULL, CONSTRAINT FK_65E8AA0A19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_65E8AA0A19EB6921 ON rendez_vous (client_id)');
        $this->addSql('CREATE TABLE reparation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date DATE NOT NULL, description VARCHAR(255) DEFAULT NULL, statut VARCHAR(20) NOT NULL, cout_total NUMERIC(10, 2) DEFAULT NULL, actif BOOLEAN DEFAULT 1 NOT NULL, vehicule_id INTEGER NOT NULL, CONSTRAINT FK_8FDF219D4A4A3511 FOREIGN KEY (vehicule_id) REFERENCES vehicule (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_8FDF219D4A4A3511 ON reparation (vehicule_id)');
        $this->addSql('CREATE TABLE reparation_piece (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, quantite INTEGER NOT NULL, reparation_id INTEGER NOT NULL, piece_id INTEGER NOT NULL, CONSTRAINT FK_7F511E497934BA FOREIGN KEY (reparation_id) REFERENCES reparation (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_7F511E4C40FCFA8 FOREIGN KEY (piece_id) REFERENCES piece (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_7F511E497934BA ON reparation_piece (reparation_id)');
        $this->addSql('CREATE INDEX IDX_7F511E4C40FCFA8 ON reparation_piece (piece_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_REPARATION_PIECE ON reparation_piece (reparation_id, piece_id)');
        $this->addSql('CREATE TABLE vehicule (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, marque VARCHAR(50) NOT NULL, modele VARCHAR(50) NOT NULL, immatriculation VARCHAR(15) NOT NULL, carburant VARCHAR(30) DEFAULT NULL, vin VARCHAR(30) DEFAULT NULL, annee SMALLINT DEFAULT NULL, kilometrage INTEGER DEFAULT NULL, actif BOOLEAN DEFAULT 1 NOT NULL, client_id INTEGER NOT NULL, CONSTRAINT FK_292FFF1D19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_292FFF1DBE73422E ON vehicule (immatriculation)');
        $this->addSql('CREATE INDEX IDX_292FFF1D19EB6921 ON vehicule (client_id)');
        $this->addSql('CREATE TABLE vehicule_occasion (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, marque VARCHAR(50) NOT NULL, modele VARCHAR(50) NOT NULL, annee SMALLINT DEFAULT NULL, kilometrage INTEGER DEFAULT NULL, prix NUMERIC(10, 2) NOT NULL, statut VARCHAR(20) NOT NULL, client_id INTEGER DEFAULT NULL, CONSTRAINT FK_C63427CE19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_C63427CE19EB6921 ON vehicule_occasion (client_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE client');
        $this->addSql('DROP TABLE devis');
        $this->addSql('DROP TABLE devis_item');
        $this->addSql('DROP TABLE facture');
        $this->addSql('DROP TABLE facture_item');
        $this->addSql('DROP TABLE piece');
        $this->addSql('DROP TABLE rendez_vous');
        $this->addSql('DROP TABLE reparation');
        $this->addSql('DROP TABLE reparation_piece');
        $this->addSql('DROP TABLE vehicule');
        $this->addSql('DROP TABLE vehicule_occasion');
    }
}
