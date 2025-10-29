export class RepositoryException extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly context?: string,
  ) {
    super(message)
    this.name = 'RepositoryException'
  }

  static saveError(originalError: Error, userId: string): RepositoryException {
    return new RepositoryException(
      `Failed to save user with ID: ${userId}`,
      originalError,
      `User ID: ${userId}`,
    )
  }

  static findError(
    originalError: Error,
    searchCriteria: string,
  ): RepositoryException {
    return new RepositoryException(
      `Failed to find user by ${searchCriteria}`,
      originalError,
      searchCriteria,
    )
  }

  static deleteError(
    originalError: Error,
    userId: string,
  ): RepositoryException {
    return new RepositoryException(
      `Failed to delete user with ID: ${userId}`,
      originalError,
      `User ID: ${userId}`,
    )
  }

  static notFoundError(searchCriteria: string): RepositoryException {
    return new RepositoryException(
      `User not found by ${searchCriteria}`,
      undefined,
      searchCriteria,
    )
  }
}
