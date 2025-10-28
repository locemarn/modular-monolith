export interface CreateUserData {
  username: string
  email: string
  password?: string
}

export interface UserPersistenceData {
  id: string
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}
