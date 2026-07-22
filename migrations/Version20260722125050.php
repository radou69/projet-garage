<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260722125050 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE facture ADD COLUMN actif BOOLEAN DEFAULT 1 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__facture AS SELECT id, date, montant_ttc, montant_acompte, date_acompte, statut, devis_id, client_id FROM facture');
        $this->addSql('DROP TABLE facture');
        $this->addSql('CREATE TABLE facture (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date DATE NOT NULL, montant_ttc NUMERIC(10, 2) NOT NULL, montant_acompte NUMERIC(10, 2) DEFAULT NULL, date_acompte DATE DEFAULT NULL, statut VARCHAR(20) NOT NULL, devis_id INTEGER NOT NULL, client_id INTEGER NOT NULL, CONSTRAINT FK_FE86641041DEFADA FOREIGN KEY (devis_id) REFERENCES devis (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_FE86641019EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO facture (id, date, montant_ttc, montant_acompte, date_acompte, statut, devis_id, client_id) SELECT id, date, montant_ttc, montant_acompte, date_acompte, statut, devis_id, client_id FROM __temp__facture');
        $this->addSql('DROP TABLE __temp__facture');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FE86641041DEFADA ON facture (devis_id)');
        $this->addSql('CREATE INDEX IDX_FE86641019EB6921 ON facture (client_id)');
    }
}
