import { UserEntity } from '../entities/user.entity'
import { EmailValueObject } from '../value-objects'

export interface IUserRepositoryInterface {
  createUser(data: UserEntity): Promise<UserEntity>
  getUserById(id: string): Promise<UserEntity | null>
  getUserByEmail(email: EmailValueObject): Promise<UserEntity | null>
  deleteUserById(id: string): Promise<UserEntity | null>
}
