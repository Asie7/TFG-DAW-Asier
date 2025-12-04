<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251203012541 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE calendars (id SERIAL NOT NULL, propietario_id INT NOT NULL, nombre VARCHAR(100) NOT NULL, descripcion VARCHAR(255) DEFAULT NULL, tipo VARCHAR(20) NOT NULL, color VARCHAR(20) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_84DF820F53C8D32C ON calendars (propietario_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN calendars.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN calendars.updated_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendars ADD CONSTRAINT FK_84DF820F53C8D32C FOREIGN KEY (propietario_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendars DROP CONSTRAINT FK_84DF820F53C8D32C
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE calendars
        SQL);
    }
}
