import { config } from 'dotenv'
import { join } from 'path'

export function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development'

  // Carrega o arquivo .env específico do ambiente
  const envFile = nodeEnv === 'production' ? '.env.production' : '.env'
  const envPath = join(process.cwd(), envFile)

  config({ path: envPath })

  console.log(`🔧 Environment: ${nodeEnv}`)
  console.log(`📁 Loaded env file: ${envFile}`)
}
