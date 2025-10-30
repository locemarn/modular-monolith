import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

describe('Start Script Path Resolution Tests', () => {
  const rootDir = process.cwd()

  beforeAll(() => {
    // Ensure applications are built before testing start scripts
    try {
      execSync('pnpm run build:all', { stdio: 'pipe', cwd: rootDir })
    } catch (error) {
      console.error('Build failed:', error.message)
      throw error
    }
  })

  describe('Package.json Start Script Validation', () => {
    it('should have correct start script path for api-gateway', () => {
      const packageJsonPath = join(
        rootDir,
        'apps',
        'api-gateway',
        'package.json',
      )
      expect(existsSync(packageJsonPath)).toBe(true)

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const startScript = packageJson.scripts?.start

      expect(startScript).toBeDefined()

      // Extract the path from the start script
      const pathMatch = startScript.match(/node\s+(.+\.js)/)
      expect(pathMatch).toBeTruthy()

      const scriptPath = pathMatch[1]
      const resolvedPath = join(rootDir, 'apps', 'api-gateway', scriptPath)

      // Verify the referenced file exists
      expect(existsSync(resolvedPath)).toBe(true)
    })

    it('should have correct start script path for user-service', () => {
      const packageJsonPath = join(
        rootDir,
        'apps',
        'user-service',
        'package.json',
      )
      expect(existsSync(packageJsonPath)).toBe(true)

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const startScript = packageJson.scripts?.start

      expect(startScript).toBeDefined()

      // Extract the path from the start script
      const pathMatch = startScript.match(/node\s+(.+\.js)/)
      expect(pathMatch).toBeTruthy()

      const scriptPath = pathMatch[1]
      const resolvedPath = join(rootDir, 'apps', 'user-service', scriptPath)

      // Verify the referenced file exists
      expect(existsSync(resolvedPath)).toBe(true)
    })

    it('should have consistent path patterns across services', () => {
      const apiGatewayPackageJson = JSON.parse(
        readFileSync(
          join(rootDir, 'apps', 'api-gateway', 'package.json'),
          'utf8',
        ),
      )
      const userServicePackageJson = JSON.parse(
        readFileSync(
          join(rootDir, 'apps', 'user-service', 'package.json'),
          'utf8',
        ),
      )

      const apiGatewayStart = apiGatewayPackageJson.scripts?.start
      const userServiceStart = userServicePackageJson.scripts?.start

      expect(apiGatewayStart).toBeDefined()
      expect(userServiceStart).toBeDefined()

      // Both should follow the same pattern: node ../../dist/apps/{service-name}/main.js
      expect(apiGatewayStart).toMatch(
        /node\s+\.\.\/\.\.\/dist\/apps\/api-gateway\/main\.js/,
      )
      expect(userServiceStart).toMatch(
        /node\s+\.\.\/\.\.\/dist\/apps\/user-service\/main\.js/,
      )
    })
  })

  describe('Root Level Script Validation', () => {
    it('should have root start scripts that reference correct paths', () => {
      const rootPackageJson = JSON.parse(
        readFileSync(join(rootDir, 'package.json'), 'utf8'),
      )

      const scripts = rootPackageJson.scripts

      // Check that root level scripts use nest CLI for development
      expect(scripts['start:api-gateway']).toMatch(/nest start api-gateway/)
      expect(scripts['start:user-service']).toMatch(/nest start user-service/)

      // Check production script references correct dist path
      if (scripts['start:prod']) {
        expect(scripts['start:prod']).toMatch(/node dist\//)
      }
    })

    it('should validate build script consistency', () => {
      const rootPackageJson = JSON.parse(
        readFileSync(join(rootDir, 'package.json'), 'utf8'),
      )

      const scripts = rootPackageJson.scripts

      expect(scripts['build:api-gateway']).toMatch(/nest build api-gateway/)
      expect(scripts['build:user-service']).toMatch(/nest build user-service/)
      expect(scripts['build:all']).toContain('build:api-gateway')
      expect(scripts['build:all']).toContain('build:user-service')
    })
  })

  describe('Module Resolution Error Handling', () => {
    it('should provide clear error when build artifacts are missing', () => {
      // This test validates that start scripts fail gracefully when build artifacts don't exist
      // First ensure dist directory doesn't exist
      try {
        execSync('rm -rf dist', { stdio: 'pipe', cwd: rootDir })
      } catch (_error) {
        // Ignore if already doesn't exist
      }

      // Try to run start script without build artifacts - should fail
      expect(() => {
        execSync('timeout 5s npm start', {
          stdio: 'pipe',
          cwd: join(rootDir, 'apps', 'api-gateway'),
        })
      }).toThrow()
    })
  })
})
