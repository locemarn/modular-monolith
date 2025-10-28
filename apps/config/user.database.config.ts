import { registerAs } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { databaseConfig } from './database.config'

export default registerAs(
  'user.database',
  (): TypeOrmModuleOptions => ({
    ...databaseConfig,
    autoLoadEntities: true,
  }),
)
