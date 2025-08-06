import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateHalalCentralTables1699234567789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vendors table
    await queryRunner.createTable(
      new Table({
        name: "vendor",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "name",
            type: "jsonb",
          },
          {
            name: "description",
            type: "jsonb",
          },
          {
            name: "address",
            type: "jsonb",
          },
          {
            name: "contact_info",
            type: "jsonb",
          },
          {
            name: "is_verified",
            type: "boolean",
            default: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "business_hours",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "certifications",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "organization_number",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "business_type",
            type: "varchar",
          },
          {
            name: "opening_hours",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "halal_certification",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "commission_rate",
            type: "decimal",
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: "cuisine_types",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "dietary_options",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "delivery_available",
            type: "boolean",
            default: false,
          },
          {
            name: "takeaway_available",
            type: "boolean",
            default: false,
          },
          {
            name: "qr_ordering_enabled",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    )

    // Create institutes table
    await queryRunner.createTable(
      new Table({
        name: "institute",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "name",
            type: "jsonb",
          },
          {
            name: "description",
            type: "jsonb",
          },
          {
            name: "address",
            type: "jsonb",
          },
          {
            name: "contact_info",
            type: "jsonb",
          },
          {
            name: "is_verified",
            type: "boolean",
            default: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "business_hours",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "certifications",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "organization_number",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "institute_type",
            type: "varchar",
          },
          {
            name: "prayer_schedule",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "donation_link",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "capacity",
            type: "integer",
            default: 0,
          },
          {
            name: "services",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    )

    // Create indexes
    await queryRunner.createIndex(
      "vendor",
      new TableIndex({
        name: "IDX_VENDOR_BUSINESS_TYPE",
        columnNames: ["business_type"],
      })
    )

    await queryRunner.createIndex(
      "vendor",
      new TableIndex({
        name: "IDX_VENDOR_IS_ACTIVE",
        columnNames: ["is_active"],
      })
    )

    await queryRunner.createIndex(
      "institute",
      new TableIndex({
        name: "IDX_INSTITUTE_TYPE",
        columnNames: ["institute_type"],
      })
    )

    await queryRunner.createIndex(
      "institute",
      new TableIndex({
        name: "IDX_INSTITUTE_IS_ACTIVE",
        columnNames: ["is_active"],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("vendor")
    await queryRunner.dropTable("institute")
  }
}