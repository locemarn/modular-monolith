import { UserResponseDto } from '../../application/dtos'
import { UserEntity } from '../../domain/entities/user.entity'
import { UserTypeOrmEntity } from '../entities/user.typeorm-entity'

export class UserMapper {
  static toDomain(entity: UserTypeOrmEntity): UserEntity {
    return UserEntity.fromPersistence({
      id: entity.id,
      username: entity.username,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  static toPersistence(user: UserEntity): UserTypeOrmEntity {
    const persistenceData = user.toPersistence()
    const entity = new UserTypeOrmEntity()

    entity.id = persistenceData.id
    entity.username = persistenceData.username
    entity.email = persistenceData.email
    entity.password = persistenceData.password
    entity.createdAt = persistenceData.createdAt
    entity.updatedAt = persistenceData.updatedAt

    return entity
  }

  static toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id.value,
      username: user.username.toString(),
      email: user.email.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
