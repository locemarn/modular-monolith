export interface DatabaseError extends Error {
  code?: string
  detail?: string
  constraint?: string
}

export interface ValidationResponse {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export interface ValidationError extends Error {
  response?: ValidationResponse
  status?: number
  statusCode?: number
}

export interface MessageObject {
  message: string[]
}

export type CatchableError = DatabaseError & ValidationError
