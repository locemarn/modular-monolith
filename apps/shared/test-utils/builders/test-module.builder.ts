import { DynamicModule, Provider, Type } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  inMemoryDatabaseConfig,
  testDatabaseConfig,
} from '../../config/database.config'

export class TestModuleBuilder {
  private imports: Array<Type<unknown> | DynamicModule> = []
  private providers: Provider[] = []
  private controllers: Type<unknown>[] = []

  static create(): TestModuleBuilder {
    return new TestModuleBuilder()
  }

  withInMemoryDatabase(): TestModuleBuilder {
    this.imports.push(TypeOrmModule.forRoot(inMemoryDatabaseConfig))
    return this
  }

  withTestDatabase(): TestModuleBuilder {
    this.imports.push(TypeOrmModule.forRoot(testDatabaseConfig))
    return this
  }

  async withConfig(): Promise<TestModuleBuilder> {
    this.imports.push(
      await ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
    )
    return this
  }

  withProviders(providers: Provider[]): TestModuleBuilder {
    this.providers.push(...providers)
    return this
  }

  withControllers(controllers: Type<unknown>[]): TestModuleBuilder {
    this.controllers.push(...controllers)
    return this
  }

  withImports(
    imports: Array<Type<unknown> | DynamicModule>,
  ): TestModuleBuilder {
    this.imports.push(...imports)
    return this
  }

  async build(): Promise<TestingModule> {
    return await Test.createTestingModule({
      imports: this.imports,
      providers: this.providers,
      controllers: this.controllers,
    }).compile()
  }
}
