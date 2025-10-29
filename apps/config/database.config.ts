// import * as dotenv from 'dotenv'
// import { DataSourceOptions } from 'typeorm'
// import { TypeOrmModuleOptions } from '@nestjs/typeorm'
// import { EventStore } from '../shared/events'
// import { UserTypeOrmEntity } from '../user-service/src/infrastructure/entities/user.typeorm-entity'
//
// dotenv.config()
//
// const parseDataBaseUrl = (url: string | undefined) => {
//   if (!url) return null
//
//   try {
//     const dbUrl = new URL(url)
//     return {
//       host: dbUrl.hostname,
//       port: dbUrl.port ? parseInt(dbUrl.port, 10) : 5432,
//       username: dbUrl.username,
//       password: dbUrl.password,
//       database: dbUrl.pathname.slice(1),
//     }
//   } catch {
//     return null
//   }
// }
//
// const parsedUrl = parseDataBaseUrl(process.env.DATABASE_URL)
//
// const baseConfig = {
//   type: 'postgres' as const,
//   host: parsedUrl?.host || process.env.POSTGRES_HOST || 'localhost',
//   port: parsedUrl?.port || parseInt(process.env.POSTGRES_PORT || '5432'),
//   username: parsedUrl?.username || process.env.POSTGRES_USER || 'postgres_user',
//   password: parsedUrl?.password || process.env.POSTGRES_PASSWORD || 'postgres_password',
//   database: parsedUrl?.database || process.env.POSTGRES_DB || 'user_service_db',
//   entities: [UserTypeOrmEntity, EventStore],
//   logging: process.env.NODE_ENV === 'development',
//   ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
// }
//
// export const databaseConfig: TypeOrmModuleOptions = {
//   ...baseConfig,
//   synchronize: process.env.NODE_ENV === 'development',
// }
//
// export const migrationConfig: DataSourceOptions = {
//   ...baseConfig,
//   migrations: ['apps/user-service/src/migrations/*.ts'],
//   synchronize: false,
// }
//
// export const testDatabaseConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: process.env.TEST_DB_HOST || 'localhost',
//   port: parseInt(process.env.TEST_DB_PORT || '5433', 10),
//   username: process.env.TEST_DB_USERNAME || 'test_user',
//   password: process.env.TEST_DB_PASSWORD || 'test_password',
//   database: process.env.TEST_DB_NAME || 'test_db',
//   entities: [UserTypeOrmEntity],
//   synchronize: true,
//   dropSchema: true,
//   logging: false,
//   autoLoadEntities: true,
// }
//
// export const inMemoryDatabaseConfig: TypeOrmModuleOptions = {
//   type: 'sqlite',
//   database: ':memory:',
//   entities: [UserTypeOrmEntity],
//   synchronize: true,
//   dropSchema: true,
//   logging: false,
// }