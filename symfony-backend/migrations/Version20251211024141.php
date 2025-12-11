<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251211024141 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE calendar_members (id SERIAL NOT NULL, calendario_id INT NOT NULL, usuario_id INT NOT NULL, rol VARCHAR(20) NOT NULL, joined_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_27D7A938A7F6EA19 ON calendar_members (calendario_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_27D7A938DB38439E ON calendar_members (usuario_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN calendar_members.joined_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendar_members ADD CONSTRAINT FK_27D7A938A7F6EA19 FOREIGN KEY (calendario_id) REFERENCES calendars (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendar_members ADD CONSTRAINT FK_27D7A938DB38439E FOREIGN KEY (usuario_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendars ADD invite_code VARCHAR(20) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_84DF820F6F21F112 ON calendars (invite_code)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendar_members DROP CONSTRAINT FK_27D7A938A7F6EA19
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendar_members DROP CONSTRAINT FK_27D7A938DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE calendar_members
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_84DF820F6F21F112
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE calendars DROP invite_code
        SQL);
    }
}
