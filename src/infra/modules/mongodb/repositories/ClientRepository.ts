import { inject, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { MongoClient, Collection, Db } from 'mongodb'
import { IClient } from '../../../../domain/client/interfaces/IClient'
import {
  IClientRepo,
  ICreateTransaction,
  IGetTransaction,
  IUpdateClient,
} from '../../../../domain/client/interfaces/IClientRepo'
import NotFoundException from '../../../../domain/exceptions/NotFoundException'
import UnprocessableEntityException from '../../../../domain/exceptions/UnprocessableEntityException'
import { ITransaction, TransactionType } from '../../../../domain/transaction'
import TYPES from '../../../server/Types'

@injectable()
export default class ClientRepository implements IClientRepo {
  private readonly clientsCollection: Collection<IClient>
  private readonly transactionsCollection: Collection<ITransaction>
  // private readonly viewCollection: Collection<IClient & ITransaction>
  private readonly db: Db
  constructor(
    @inject(TYPES.MongoDBConnection) private mongoClient: MongoClient,
  ) {
    this.db = this.mongoClient.db('mongodb')
    this.clientsCollection = this.db.collection('clients')
    this.transactionsCollection = this.db.collection('transactions')
    // this.viewCollection = this.db.collection('view_clients_transactions')
  }

  async createTransaction(
    params: IUpdateClient & ICreateTransaction,
  ): Promise<IClient> {
    const session = this.mongoClient.startSession()

    const result = await session.withTransaction(async (session) => {
      const client = await this.clientsCollection.findOne<IClient>(
        {
          id: params.client_id,
        },
        { session },
      )
      if (!client) throw new NotFoundException('client not found')

      if (
        params.type === TransactionType.DEBIT &&
        client.balance - params.amount < -client.limit
      )
        throw new UnprocessableEntityException('operation not permited')

      const newBalance =
        params.type === TransactionType.CREDIT
          ? client.balance + params.amount
          : client.balance - params.amount

      await Promise.all([
         this.clientsCollection.updateOne(
          { id: params.client_id },
          { $set: { balance: newBalance } },
          { session },
        ),
           this.transactionsCollection.insertOne(
            {
              client_id: params.client_id,
              amount: params.amount,
              type: params.type,
              description: params.description,
              created_at: new Date(),
            },
            { session },
          )
      ])
      return { limit: client.limit, balance: newBalance } as IClient
    })

    return result
  }

  async getTransaction(
    params: IGetTransaction,
  ): Promise<Array<IClient & ITransaction>> {
    const session = this.mongoClient.startSession()
    const result = await session.withTransaction(async (session) => {
      // const transactions = await this.viewCollection
      // .aggregate<
      //   IClient & ITransaction
      // >([{ $match: { id: params.client_id } }, { $unwind: { path: '$transactions', preserveNullAndEmptyArrays: true } }, { $sort: { 'transactions.created_at': -1 } }, { $limit: 10 }], {session})
      // .toArray()

      const transactions = await this.clientsCollection
        .aggregate<IClient & ITransaction>(
          [
            { $match: { id: params.client_id } },
            {
              $lookup: {
                from: 'transactions',
                localField: 'id',
                foreignField: 'client_id',
                as: 'transactions',
              },
            },
            {
              $unwind: {
                path: '$transactions',
                preserveNullAndEmptyArrays: true,
              },
            },
            { $sort: { 'transactions.created_at': -1 } },
            { $limit: 10 },
          ],
          { session },
        )
        .toArray()

      return transactions
    })
    if (isEmpty(result)) throw new NotFoundException('client not found')
    return result
  }
}
