import 'reflect-metadata'
import { Logger } from '@nestjs/common'

type TestUtils = {
  createMockFunction: <
    T extends (...args: unknown[]) => unknown,
  >() => jest.Mock<ReturnType<T>, Parameters<T>>
  createMockObject: <T extends Record<string, unknown>>(
    overrides?: Partial<T>,
  ) => T
}

declare global {
  var testUtils: TestUtils
}

jest.setTimeout(30000)

process.env.NODE_ENV = 'test'

global.testUtils = {
  createMockFunction: <T extends (...args: unknown[]) => unknown>() =>
    jest.fn<ReturnType<T>, Parameters<T>>(),
  createMockObject: <T extends Record<string, unknown>>(
    overrides: Partial<T> = {},
  ) => ({ ...overrides }) as T,
}

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => ({}))
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => ({}))
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => ({}))
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => ({}))
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => ({}))

jest.spyOn(global.console, 'error').mockImplementation(() => ({}))
jest.spyOn(global.console, 'warn').mockImplementation(() => ({}))

beforeAll(() => {
  jest.spyOn(process.stderr, 'write').mockImplementation(() => true as boolean)
  jest.spyOn(process.stdout, 'write').mockImplementation(() => true as boolean)
})

Logger.overrideLogger([])
