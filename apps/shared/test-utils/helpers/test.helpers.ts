import { INestApplication, ValidationPipe } from '@nestjs/common'

export class TestHelpers {
  static setupApp(app: INestApplication): void {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
  }

  static waitFor(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
  }

  static generateRandomEmail(): string {
    const randomString = Math.random().toString(36).substring(7)
    return `test-${randomString}@example.com`
  }

  static generateRandomUsername(): string {
    const randomString = Math.random().toString(36).substring(7)
    return `user-${randomString}`
  }

  static createTestTimeout(seconds: number): number {
    return seconds * 1000
  }
}
