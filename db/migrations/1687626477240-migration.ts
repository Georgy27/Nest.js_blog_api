import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1687626477240 implements MigrationInterface {
    name = 'Migration1687626477240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blogger" ("bloggerId" character varying NOT NULL, "userId" uuid, CONSTRAINT "REL_3252d36bf1ff417ba8424f3744" UNIQUE ("userId"), CONSTRAINT "PK_2da0f6eccfb4e1fc61c3ceef7ed" PRIMARY KEY ("bloggerId"))`);
        await queryRunner.query(`CREATE TABLE "device_sessions" ("deviceId" character varying NOT NULL, "ip" character varying NOT NULL, "deviceName" character varying NOT NULL, "lastActiveDate" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_1a58500a3b9369f33812a360f15" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`ALTER TABLE "blogger" ADD CONSTRAINT "FK_3252d36bf1ff417ba8424f37443" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device_sessions" ADD CONSTRAINT "FK_336070a77b04552cd1640dc56a7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device_sessions" DROP CONSTRAINT "FK_336070a77b04552cd1640dc56a7"`);
        await queryRunner.query(`ALTER TABLE "blogger" DROP CONSTRAINT "FK_3252d36bf1ff417ba8424f37443"`);
        await queryRunner.query(`DROP TABLE "device_sessions"`);
        await queryRunner.query(`DROP TABLE "blogger"`);
    }

}
