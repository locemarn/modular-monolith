import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1761081162022 implements MigrationInterface {
  name = 'Init1761081162022'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(254) NOT NULL, "username" character varying(30) NOT NULL, "password" character varying(254) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."email" IS 'User Email address (Unique)'; COMMENT ON COLUMN "users"."username" IS 'User Username (Unique)'; COMMENT ON COLUMN "users"."password" IS 'User Password'; COMMENT ON COLUMN "users"."createdAt" IS 'Timestamp of entity creation'; COMMENT ON COLUMN "users"."updatedAt" IS 'Timestamp of entity last update'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
