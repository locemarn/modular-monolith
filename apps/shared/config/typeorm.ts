import { DataSource } from 'typeorm'
import { migrationConfig } from './database.config'

export default new DataSource(migrationConfig)