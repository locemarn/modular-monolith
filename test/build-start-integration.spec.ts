import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

describe('Build → Start Workflow Integration Tests', () => {
  const rootDir = process.cwd()
  const distDir = join(rootDir, 'dist')

  beforeAll(() => {
    // Clean and build all applications for testing
    try {
      execSync('rm -rf dist', { stdio: 'pipe', cwd: rootDir })
      execSync('pnpm run build:all', { stdio: 'pipe', cwd: rootDir })
    } catch (_error) {
      // Build may fail, tests will catch this
    }
  })

  describe('Build and Start Script Integration', () => {
    it('should build api-gateway and create correct file structure', () => {
      // Verify build creates expected structure
      const apiGatewayMain = join(distDir, 'apps', 'api-gateway', 'main.js')
      expect(existsSync(apiGatewayMain)).toBe(true)
    })

    it('should build user-service and create correct file structure', () => {
      // Verify build creates expected structure
      const userServiceMain = join(distDir, 'apps', 'user-service', 'main.js')
      expect(existsSync(userServiceMain)).toBe(true)
    })

    it('should validate start script paths exist', () => {
      // Check that the paths referenced in start scripts actually exist
      const apiGatewayPath = join(
        rootDir,
        'dist',
        'apps',
        'api-gateway',
        'main.js',
      )
      const userServicePath = join(
        rootDir,
        'dist',
        'apps',
        'user-service',
        'main.js',
      )

      expect(existsSync(apiGatewayPath)).toBe(true)
      expect(existsSync(userServicePath)).toBe(true)
    })

    it('should handle individual service builds', () => {
      // Test individual builds work
      expect(() => {
        execSync('pnpm run build:api-gateway', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()

      expect(() => {
        execSync('pnpm run build:user-service', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()
    })

    it('should handle build:all command', () => {
      expect(() => {
        execSync('pnpm run build:all', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()

      // Verify both services built
      const apiGatewayMain = join(distDir, 'apps', 'api-gateway', 'main.js')
      const userServiceMain = join(distDir, 'apps', 'user-service', 'main.js')

      expect(existsSync(apiGatewayMain)).toBe(true)
      expect(existsSync(userServiceMain)).toBe(true)
    })
  })
})
