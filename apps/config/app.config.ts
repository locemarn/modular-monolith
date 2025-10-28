import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    jwtSecret:
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}))
