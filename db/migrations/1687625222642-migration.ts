import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1687625222642 implements MigrationInterface {
    name = 'Migration1687625222642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation" ("userId" uuid NOT NULL, "confirmationCode" character varying NOT NULL, "expirationDate" character varying NOT NULL, "isConfirmed" boolean NOT NULL, CONSTRAINT "PK_28d3d3fbd7503f3428b94fd18cc" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`DROP TABLE "email_confirmation"`);
    }

}
