import { UserTestFactory } from '../../../../shared/test-utils/factories/user-test.factory'
import { UserEntity } from '../../domain/entities/user.entity'
import { UserTypeOrmEntity } from '../entities/user.typeorm-entity'
import { UserMapper } from './user.mapper'

describe('UserMapper (Unit)', () => {
  const mockTypeOrmEntity: UserTypeOrmEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$hashedPassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  }

  describe('toDomain', () => {
    it('should convert TypeORM entity to domain entity', () => {
      const domainEntity = UserMapper.toDomain(mockTypeOrmEntity)

      expect(domainEntity).toBeInstanceOf(UserEntity)
      expect(domainEntity.id.value).toBe(mockTypeOrmEntity.id)
      expect(domainEntity.email.toString()).toBe(mockTypeOrmEntity.email)
      expect(domainEntity.username.toString()).toBe(mockTypeOrmEntity.username)
    })
  })

  describe('toPersistence', () => {
    it('should convert domain entity to TypeORM entity', () => {
      const domainEntity = UserTestFactory.createUserEntity()

      const typeOrmEntity = UserMapper.toPersistence(domainEntity)

      expect(typeOrmEntity).toBeInstanceOf(UserTypeOrmEntity)
      expect(typeOrmEntity.id).toBe(domainEntity.id.value)
      expect(typeOrmEntity.email).toBe(domainEntity.email.toString())
      expect(typeOrmEntity.username).toBe(domainEntity.username.toString())
      expect(typeOrmEntity.password).toBe(domainEntity.password.toString())
    })
  })

  describe('toResponseDto', () => {
    it('should convert domain entity to response DTO without password', () => {
      const domainEntity = UserTestFactory.createUserEntity()

      const dto = UserMapper.toResponseDto(domainEntity)

      expect(dto).toHaveProperty('id')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('username')
      expect(dto).toHaveProperty('createdAt')
      expect(dto).toHaveProperty('updatedAt')
      expect(dto).not.toHaveProperty('password')
    })
  })
})
