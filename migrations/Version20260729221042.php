<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260729221042 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, email, roles, password, nom, actif, nom_garage, adresse_garage FROM user');
        $this->addSql('DROP TABLE user');
        $this->addSql('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles CLOB NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(50) NOT NULL, actif BOOLEAN NOT NULL, nom_garage VARCHAR(100) DEFAULT NULL, adresse_garage VARCHAR(255) DEFAULT NULL, patron_id INTEGER DEFAULT NULL, CONSTRAINT FK_8D93D649DBD5322 FOREIGN KEY (patron_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO user (id, email, roles, password, nom, actif, nom_garage, adresse_garage) SELECT id, email, roles, password, nom, actif, nom_garage, adresse_garage FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON user (email)');
        $this->addSql('CREATE INDEX IDX_8D93D649DBD5322 ON user (patron_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__vehicule_occasion AS SELECT id, marque, modele, annee, kilometrage, prix, statut, client_id FROM vehicule_occasion');
        $this->addSql('DROP TABLE vehicule_occasion');
        $this->addSql('CREATE TABLE vehicule_occasion (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, marque VARCHAR(50) NOT NULL, modele VARCHAR(50) NOT NULL, annee SMALLINT DEFAULT NULL, kilometrage INTEGER DEFAULT NULL, prix NUMERIC(10, 2) NOT NULL, statut VARCHAR(20) NOT NULL, client_id INTEGER DEFAULT NULL, utilisateur_id INTEGER DEFAULT NULL, CONSTRAINT FK_C63427CE19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_C63427CEFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO vehicule_occasion (id, marque, modele, annee, kilometrage, prix, statut, client_id) SELECT id, marque, modele, annee, kilometrage, prix, statut, client_id FROM __temp__vehicule_occasion');
        $this->addSql('DROP TABLE __temp__vehicule_occasion');
        $this->addSql('CREATE INDEX IDX_C63427CE19EB6921 ON vehicule_occasion (client_id)');
        $this->addSql('CREATE INDEX IDX_C63427CEFB88E14F ON vehicule_occasion (utilisateur_id)');

        // Backfill isolation multi-tenant : rattachement des comptes/données existants
        // à leur patron, aucun lien n'existant avant cette migration.
        // Employés existants (kevin, florence, fred, testemploye, kevin@mail.com) -> michel@garage.fr (id 1)
        $this->addSql('UPDATE user SET patron_id = 1 WHERE id IN (2, 3, 4, 9, 10)');
        // Stock véhicules d'occasion existant (id 1,2 : dérivé du client -> michel ; id 3,4 : sans client, michel par défaut, confirmé)
        $this->addSql('UPDATE vehicule_occasion SET utilisateur_id = 1 WHERE id IN (1, 2, 3, 4)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, email, roles, password, nom, actif, nom_garage, adresse_garage FROM user');
        $this->addSql('DROP TABLE user');
        $this->addSql('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles CLOB NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(50) NOT NULL, actif BOOLEAN NOT NULL, nom_garage VARCHAR(100) DEFAULT NULL, adresse_garage VARCHAR(255) DEFAULT NULL)');
        $this->addSql('INSERT INTO user (id, email, roles, password, nom, actif, nom_garage, adresse_garage) SELECT id, email, roles, password, nom, actif, nom_garage, adresse_garage FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON user (email)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__vehicule_occasion AS SELECT id, marque, modele, annee, kilometrage, prix, statut, client_id FROM vehicule_occasion');
        $this->addSql('DROP TABLE vehicule_occasion');
        $this->addSql('CREATE TABLE vehicule_occasion (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, marque VARCHAR(50) NOT NULL, modele VARCHAR(50) NOT NULL, annee SMALLINT DEFAULT NULL, kilometrage INTEGER DEFAULT NULL, prix NUMERIC(10, 2) NOT NULL, statut VARCHAR(20) NOT NULL, client_id INTEGER DEFAULT NULL, CONSTRAINT FK_C63427CE19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO vehicule_occasion (id, marque, modele, annee, kilometrage, prix, statut, client_id) SELECT id, marque, modele, annee, kilometrage, prix, statut, client_id FROM __temp__vehicule_occasion');
        $this->addSql('DROP TABLE __temp__vehicule_occasion');
        $this->addSql('CREATE INDEX IDX_C63427CE19EB6921 ON vehicule_occasion (client_id)');
    }
}
