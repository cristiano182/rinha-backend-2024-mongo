import env from 'env-var'
export default {
  mode: env.get('NODE_ENV').default('development').asString(),
  PORT: env.get('PORT').default(3000).asPortNumber(),
} as const
