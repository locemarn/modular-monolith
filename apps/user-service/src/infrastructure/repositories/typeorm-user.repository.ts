import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../domain/entities/user.entity'
import { IUserRepositoryInterface } from '../../domain/repositories/user.repository.interface'
import { EmailValueObject } from '../../domain/value-objects'
import { UserTypeOrmEntity } from '../entities/user.typeorm-entity'
import { RepositoryException } from '../exceptions/repository.exception'
import { UserMapper } from '../mapper/user.mapper'

@Injectable()
export class TypeOrmUserRepository implements IUserRepositoryInterface {
  private readonly logger = new Logger(TypeOrmUserRepository.name)

  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly userRepository: Repository<UserTypeOrmEntity>,
  ) {}

  async createUser(user: UserEntity): Promise<UserEntity> {
    try {
      this.logger.debug(`Saving user with ID: ${user.id.value}`)

      const entity = UserMapper.toPersistence(user)
      const savedEntity = await this.userRepository.save(entity)

      this.logger.debug(`Successfully saved user with ID: ${user.id.value}`)
      return UserMapper.toDomain(savedEntity)
    } catch (error) {
      const err = error as Error
      if (!err.message?.includes('UNIQUE constraint')) {
        this.logger.error(`Failed to save user with ID: ${user.id.value}`, err)
      }
      throw RepositoryException.saveError(error as Error, user.id.value)
    }
  }
  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`)
      const entity = await this.userRepository.findOneBy({ id })
      if (!entity) {
        this.logger.error(`User with ID ${id} not found`)
        return null
      }

      this.logger.debug(`Successfully found user by ID: ${id}`)
      return UserMapper.toDomain(entity)
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${id}`, error)
      throw RepositoryException.findError(error as Error, `ID ${id}`)
    }
  }

  async getUserByEmail(email: EmailValueObject): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Finding user by email: ${email.toString()}`)
      const entity = await this.userRepository.findOneBy({
        email: email.toString(),
      })
      if (!entity) {
        this.logger.debug(`User with email ${email.toString()} not found`)
        return null
      }
      this.logger.debug(`Successfully found user by email`)
      return UserMapper.toDomain(entity)
    } catch (error) {
      this.logger.error(`Failed to find user by email`, error)
      throw RepositoryException.findError(
        error as Error,
        `email ${email.toString()}`,
      )
    }
  }

  async deleteUserById(id: string): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Deleting user by ID: ${id}`)

      const user = await this.getUserById(id)
      if (!user) throw RepositoryException.notFoundError(`ID ${id}`)

      await this.userRepository.delete({ id: id })
      this.logger.debug(`Successfully deleted user by ID: ${id}`)
      return user
    } catch (error) {
      this.logger.error(`Failed to delete user by ID: ${id}`, error)
      if (error instanceof RepositoryException) {
        throw error
      }
      throw RepositoryException.deleteError(error as Error, id)
    }
  }
}
