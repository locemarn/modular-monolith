export interface User {
  username: string
  email: string
  id: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
}

export interface UserResponse extends CreateUserRequest {
  id: string
  createdAt: Date
  updatedAt: Date
}
