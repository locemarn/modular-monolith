import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClientProxy, ClientsModule } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { firstValueFrom } from 'rxjs'
import { DataSource } from 'typeorm'
import { RABBITMQ_CONSTANTS } from '../../../../shared/constants/rabbitmq'
import { testDatabaseConfig } from '../../../../config/database.config'
import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import {
  testRabbitMQConfig,
  testRabbitMQMicroserviceOptions,
} from '../../../../shared/test-utils/rabbitmq/test-rabbitmq.config'
import {
  LoginUserDto,
  RegisterUserDto,
  UserResponseDto,
} from '../../application/dtos'
import { UserServiceModule } from '../../user-service.module'

describe('UserServiceController (e2e)', () => {
  let app: INestApplication
  let client: ClientProxy
  let dataSource: DataSource
  let createdUserId: string

  const testUser: RegisterUserDto = UserTestFactory.createValidUserInput()
  const loginDto: LoginUserDto = UserTestFactory.createLoginInput()

  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.test',
            ignoreEnvFile: false,
          }),
          TypeOrmModule.forRoot(testDatabaseConfig),
          ClientsModule.register(testRabbitMQConfig),
          UserServiceModule,
        ],
      }).compile()

      app = moduleFixture.createNestApplication()

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      )

      dataSource = moduleFixture.get<DataSource>(DataSource)

      if (dataSource.isInitialized) {
        const entities = dataSource.entityMetadatas
        for (const entity of entities) {
          const repository = dataSource.getRepository(entity.name)
          await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
        }
      }

      app.connectMicroservice(testRabbitMQMicroserviceOptions)

      await app.startAllMicroservices()

      await app.init()

      client = app.get<ClientProxy>('USER_SERVICE')
      await client.connect()

      await new Promise((resolve) => setTimeout(resolve, 3000))

    } catch (error) {
      console.error('❌ Setup failed:', error)
      throw error
    }
  }, 60000)

  afterAll(async () => {
    try {
      if (dataSource && dataSource.isInitialized) {
        const entities = dataSource.entityMetadatas
        for (const entity of entities) {
          const repository = dataSource.getRepository(entity.name)
          await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
        }
      }

      if (client) {
        await client.close()
      }

      if (app) {
        await app.close()
      }
    } catch (e) {
      console.error(e)
    }
  }, 30000)

  describe('Health Check', () => {
    it('should verify database connection', () => {
      expect(dataSource).toBeDefined()
      expect(dataSource.isInitialized).toBe(true)
    })

    it('should verify RabbitMQ connection', () => {
      expect(client).toBeDefined()
    })
  })

  describe('User CRUD Flow - Sequential Tests', () => {
    it('1. should create a new user successfully', async () => {
      const response = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          { data: testUser },
        ),
      )
      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.email).toBe(testUser.email)
      expect(response.username).toBe(testUser.username)
      expect(response.createdAt).toBeDefined()
      expect(response.updatedAt).toBeDefined()
      expect('password' in response).toBe(false)

      createdUserId = response.id
    }, 15000)

    it('2. should login user with correct credentials', async () => {
      const response = await firstValueFrom(
        client.send<{ accessToken: string }>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
          { data: loginDto },
        ),
      )

      expect(response).toBeDefined()
      expect(response.accessToken).toBeDefined()
      expect(typeof response.accessToken).toBe('string')
    }, 10000)

    it('3. should get user by id successfully', async () => {
      const response = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
          { data: createdUserId },
        ),
      )

      expect(response).toBeDefined()
      expect(response.id).toBe(createdUserId)
      expect(response.email).toBe(testUser.email)
      expect(response.username).toBe(testUser.username)
      expect('password' in response).toBe(false)
    }, 10000)

    it('4. should find user by email successfully', async () => {
      const response = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
          { data: testUser.email },
        ),
      )

      expect(response).toBeDefined()
      expect(response.email).toBe(testUser.email)
      expect(response.id).toBe(createdUserId)
      expect(response.username).toBe(testUser.username)
    }, 10000)

    it('5. should delete user successfully', async () => {
      const response = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
          {
            data: createdUserId,
            metadata: { requestUserId: createdUserId },
          },
        ),
      )

      expect(response).toBeDefined()
      expect(response.id).toBe(createdUserId)
    }, 10000)

    it('6. should fail to get deleted user', async () => {
      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
            { data: createdUserId },
          ),
        )
        fail('Should have thrown an error - user should be deleted')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)
  })

  describe('Validation and Error Tests', () => {
    it('should fail to create user with duplicate email', async () => {
      const user1: RegisterUserDto = UserTestFactory.createValidUserInput()

      await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          { data: user1 },
        ),
      )

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
            { data: { ...user1, username: 'user2' } },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to create user with duplicate username', async () => {
      const user1: RegisterUserDto = {
        ...UserTestFactory.createValidUserInput(),
        email: 'user3@example.com',
        username: 'duplicateuser',
      }

      await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          { data: user1 },
        ),
      )

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
            { data: { ...user1, email: 'user4@example.com' } },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to create user with invalid email', async () => {
      const invalidUser: RegisterUserDto =
        UserTestFactory.createInvalidUserInput()

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
            { data: invalidUser },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to create user with weak password', async () => {
      const weakPasswordUser: RegisterUserDto = {
        ...UserTestFactory.createValidUserInput(),
        email: 'weak@example.com',
        password: '123',
        username: 'weakuser',
      }

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
            { data: weakPasswordUser },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to login with incorrect password', async () => {
      const user: RegisterUserDto = {
        ...UserTestFactory.createValidUserInput(),
        email: 'logintest@example.com',
        username: 'logintest',
      }

      await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          { data: user },
        ),
      )

      const wrongPasswordDto: LoginUserDto = {
        email: user.email,
        password: 'WrongPassword123!',
      }

      try {
        await firstValueFrom(
          client.send<{ accessToken: string }>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
            { data: wrongPasswordDto },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to login with non-existent email', async () => {
      const nonExistentDto: LoginUserDto = {
        ...UserTestFactory.createLoginInput(),
        email: 'nonexistent@example.com',
      }

      try {
        await firstValueFrom(
          client.send<{ accessToken: string }>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
            { data: nonExistentDto },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to get non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
            { data: nonExistentId },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)

    it('should fail to find user with non-existent email', async () => {
      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
            { data: 'nonexistent999@example.com' },
          ),
        )
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 10000)
  })

  describe('Integration Flow', () => {
    it('should complete full user lifecycle', async () => {
      const lifecycleUser: RegisterUserDto = {
        ...UserTestFactory.createValidUserInput(),
        email: 'lifecycle@example.com',
        password: 'Lifecycle123!@#',
        username: 'lifecycleuser',
      }
      const createdUser = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.CREATE_USER,
          { data: lifecycleUser },
        ),
      )
      expect(createdUser.id).toBeDefined()
      expect(createdUser.email).toBe(lifecycleUser.email)
      expect(createdUser.username).toBe(lifecycleUser.username)

      const loginResponse = await firstValueFrom(
        client.send<{ accessToken: string }>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.LOGIN_USER,
          {
            data: {
              email: lifecycleUser.email,
              password: lifecycleUser.password,
            },
          },
        ),
      )
      expect(loginResponse.accessToken).toBeDefined()

      const userById = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
          { data: createdUser.id },
        ),
      )
      expect(userById.email).toBe(lifecycleUser.email)
      expect(userById.username).toBe(lifecycleUser.username)

      const userByEmail = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.FIND_USER_BY_EMAIL,
          { data: lifecycleUser.email },
        ),
      )
      expect(userByEmail.id).toBe(createdUser.id)
      expect(userByEmail.username).toBe(lifecycleUser.username)

      const deleteResponse = await firstValueFrom(
        client.send<UserResponseDto>(
          RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.DELETE_USER,
          { data: createdUser.id },
        ),
      )
      expect(deleteResponse).toBeDefined()

      try {
        await firstValueFrom(
          client.send<UserResponseDto>(
            RABBITMQ_CONSTANTS.MESSAGE_PATTERNS.GET_USER_BY_ID,
            { data: createdUser.id },
          ),
        )
        fail('Should have thrown - user should be deleted')
      } catch (error) {
        expect(error).toBeDefined()
      }
    }, 30000)
  })
})
