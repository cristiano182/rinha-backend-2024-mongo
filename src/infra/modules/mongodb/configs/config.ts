import env from 'env-var'
import { TransactionOptions } from 'mongodb'

export interface Datasource {
  host: string
}

const mongoConfig: Datasource = {
  host: env.get('MONGO_CONNECTION').required().asString(),
}

const transactionOptions: TransactionOptions = {
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' },
}

export { mongoConfig, transactionOptions }
