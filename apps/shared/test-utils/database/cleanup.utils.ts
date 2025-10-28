import { DataSource } from 'typeorm'

export class DatabaseCleanupUtils {
  static async cleanupDatabase(dataSource: DataSource): Promise<void> {
    if (!dataSource.isInitialized) {
      return
    }

    const entities = dataSource.entityMetadatas

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name)
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
    }
  }

  static async seedTestData(dataSource: DataSource): Promise<void> {
    // Add seed data logic here if needed
  }

  static async resetSequences(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas

    for (const entity of entities) {
      if (entity.primaryColumns.length > 0) {
        const primaryColumn = entity.primaryColumns[0]
        if (primaryColumn.generationStrategy === 'increment') {
          await dataSource.query(
            `ALTER SEQUENCE ${entity.tableName}_${primaryColumn.databaseName}_seq RESTART WITH 1`,
          )
        }
      }
    }
  }
}
