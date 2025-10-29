export class ModuleStartupError extends Error {
  constructor(
    public moduleName: string,
    public port: number,
    public originalError: Error,
  ) {
    super(
      `Failed to start module ${moduleName} on port ${port}: ${originalError.message}`,
    )
  }
}

export class ConfigValidationService {
  validatePortConflicts(ports: number[]): ValidationResult {
    const duplicates = ports.filter(
      (port, index) => ports.indexOf(port) !== index,
    )

    return {
      isValid: duplicates.length === 0,
      errors: duplicates.map(
        (port) => `Port ${port} is used by multiple modules`,
      ),
    }
  }
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}
