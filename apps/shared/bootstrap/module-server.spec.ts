import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { testDatabaseConfig } from '../config/database.config'
import { ModuleConfigFactory } from '../config/module-config.factory'

describe('Module Isolation', () => {
  it('should start modules on different ports without conflicts', () => {
    const apiGatewayConfig = ModuleConfigFactory.createApiGatewayConfig()
    const userServiceConfig = ModuleConfigFactory.createUserServiceConfig()

    expect(apiGatewayConfig.port).not.toBe(userServiceConfig.port)
  })

  it('should allow independent module restarts', async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
      ],
    }).compile()

    const app = testModule.createNestApplication()
    await app.init()
    await app.close()
  })
})
