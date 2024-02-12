import { ITransaction } from '@domain/transaction'

export interface IClient {
  id: number
  balance: number
  limit: number
  name: string
  transactions: ITransaction[]
}
