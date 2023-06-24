import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1687625676474 implements MigrationInterface {
    name = 'Migration1687625676474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`CREATE TABLE "ban_info" ("userId" uuid NOT NULL, "isBanned" boolean NOT NULL, "banDate" character varying, "banReason" character varying, CONSTRAINT "PK_a7b316fecc756363a039a123545" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ban_info" ADD CONSTRAINT "FK_a7b316fecc756363a039a123545" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ban_info" DROP CONSTRAINT "FK_a7b316fecc756363a039a123545"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`DROP TABLE "ban_info"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
