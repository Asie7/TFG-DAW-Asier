<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251207014222 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE events (id SERIAL NOT NULL, calendario_id INT NOT NULL, creador_id INT NOT NULL, titulo VARCHAR(200) NOT NULL, descripcion TEXT DEFAULT NULL, fecha_inicio TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, fecha_fin TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, color VARCHAR(20) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5387574AA7F6EA19 ON events (calendario_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5387574A62F40C3D ON events (creador_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN events.fecha_inicio IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN events.fecha_fin IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN events.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events ADD CONSTRAINT FK_5387574AA7F6EA19 FOREIGN KEY (calendario_id) REFERENCES calendars (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events ADD CONSTRAINT FK_5387574A62F40C3D FOREIGN KEY (creador_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events DROP CONSTRAINT FK_5387574AA7F6EA19
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events DROP CONSTRAINT FK_5387574A62F40C3D
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE events
        SQL);
    }
}
