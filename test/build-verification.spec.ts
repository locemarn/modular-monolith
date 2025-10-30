import { execSync } from 'child_process'
import { existsSync, statSync } from 'fs'
import { join } from 'path'

describe('Build Verification Tests', () => {
  const rootDir = process.cwd()
  const distDir = join(rootDir, 'dist')
  const appsDistDir = join(distDir, 'apps')

  describe('Build Output Structure', () => {
    beforeAll(() => {
      // Clean and build all applications
      try {
        execSync('pnpm run build:all', { stdio: 'pipe', cwd: rootDir })
      } catch (error) {
        console.error('Build failed:', error.message)
        throw error
      }
    })

    it('should create dist directory structure', () => {
      expect(existsSync(distDir)).toBe(true)
      expect(existsSync(appsDistDir)).toBe(true)
      expect(statSync(distDir).isDirectory()).toBe(true)
      expect(statSync(appsDistDir).isDirectory()).toBe(true)
    })

    it('should build api-gateway to correct output directory', () => {
      const apiGatewayDistDir = join(appsDistDir, 'api-gateway')
      const mainJsPath = join(apiGatewayDistDir, 'main.js')

      expect(existsSync(apiGatewayDistDir)).toBe(true)
      expect(existsSync(mainJsPath)).toBe(true)
      expect(statSync(apiGatewayDistDir).isDirectory()).toBe(true)
      expect(statSync(mainJsPath).isFile()).toBe(true)
    })

    it('should build user-service to correct output directory', () => {
      const userServiceDistDir = join(appsDistDir, 'user-service')
      const mainJsPath = join(userServiceDistDir, 'main.js')

      expect(existsSync(userServiceDistDir)).toBe(true)
      expect(existsSync(mainJsPath)).toBe(true)
      expect(statSync(userServiceDistDir).isDirectory()).toBe(true)
      expect(statSync(mainJsPath).isFile()).toBe(true)
    })

    it('should generate main.js files as entry points', () => {
      const apiGatewayMain = join(appsDistDir, 'api-gateway', 'main.js')
      const userServiceMain = join(appsDistDir, 'user-service', 'main.js')

      expect(existsSync(apiGatewayMain)).toBe(true)
      expect(existsSync(userServiceMain)).toBe(true)

      // Verify files are not empty
      expect(statSync(apiGatewayMain).size).toBeGreaterThan(0)
      expect(statSync(userServiceMain).size).toBeGreaterThan(0)
    })
  })

  describe('Individual Build Commands', () => {
    beforeEach(() => {
      // Clean dist directory before each test
      try {
        execSync('rm -rf dist', { stdio: 'pipe', cwd: rootDir })
      } catch (error) {
        // Ignore if dist doesn't exist
      }
    })

    it('should successfully build api-gateway individually', () => {
      expect(() => {
        execSync('pnpm run build:api-gateway', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()

      const apiGatewayMain = join(appsDistDir, 'api-gateway', 'main.js')
      expect(existsSync(apiGatewayMain)).toBe(true)
    })

    it('should successfully build user-service individually', () => {
      expect(() => {
        execSync('pnpm run build:user-service', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()

      const userServiceMain = join(appsDistDir, 'user-service', 'main.js')
      expect(existsSync(userServiceMain)).toBe(true)
    })

    it('should successfully build all services with build:all command', () => {
      expect(() => {
        execSync('pnpm run build:all', { stdio: 'pipe', cwd: rootDir })
      }).not.toThrow()

      const apiGatewayMain = join(appsDistDir, 'api-gateway', 'main.js')
      const userServiceMain = join(appsDistDir, 'user-service', 'main.js')

      expect(existsSync(apiGatewayMain)).toBe(true)
      expect(existsSync(userServiceMain)).toBe(true)
    })
  })
})