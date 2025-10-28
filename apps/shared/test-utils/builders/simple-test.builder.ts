import { DynamicModule, Provider, Type } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { inMemoryDatabaseConfig } from '../../../config/database.config'

export async function createTestModule(options: {
  providers?: Provider[]
  controllers?: Type<unknown>[]
  imports?: Array<Type<unknown> | DynamicModule>
}): Promise<TestingModule> {
  const imports = [
    TypeOrmModule.forRoot(inMemoryDatabaseConfig),
    ...(options.imports || []),
  ]

  return await Test.createTestingModule({
    imports,
    providers: options.providers || [],
    controllers: options.controllers || [],
  }).compile()
}
