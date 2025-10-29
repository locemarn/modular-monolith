export const RABBITMQ_CONSTANTS = {
  SERVICES: {
    USER_SERVICE: 'USER_SERVICE',
  },
  QUEUES: {
    USER_QUEUE: 'user_queue',
  },
  MESSAGE_PATTERNS: {
    GET_USER_BY_ID: 'GET_USER_BY_ID',
    CREATE_USER: 'CREATE_USER',
    DELETE_USER: 'DELETE_USER',
    FIND_USER_BY_EMAIL: 'FIND_USER_BY_EMAIL',
    LOGIN_USER: 'LOGIN_USER',
  },
  RABBITMQ_URL:
    process.env.NODE_ENV === 'production'
      ? process.env.CLOUDAMQP_URL
      : process.env.RABBITMQ_URL,
}
