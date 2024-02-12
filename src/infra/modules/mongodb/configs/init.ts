import { MongoClient } from 'mongodb'

const load = async (mongoClient: MongoClient) => {
  const db = mongoClient.db('mongodb')

  const clientes = await db.createCollection('clients')
  const transactions = await db.createCollection('transactions')

  await clientes.drop()
  await transactions.drop()

  // await db.collection('view_clients_transactions').drop()

  // await db.createCollection('view_clients_transactions', {
  //   viewOn: 'clients',
  //   pipeline: [
  //     {
  //       $lookup: {
  //         from: 'transactions',
  //         localField: 'id',
  //         foreignField: 'client_id',
  //         as: 'transactions',
  //       },
  //     },
  //   ],
  // })

  await clientes.createIndex({ id: 1 })
  await clientes.createIndex({ balance: 1 })

  await transactions.createIndex({ client_id: 1 })
  await transactions.createIndex({ id: 1 })

  await clientes.insertMany([
    {
      id: 1,
      limit: 100000,
      balance: 0,
    },
    {
      id: 2,
      limit: 80000,
      balance: 0,
    },
    {
      id: 3,
      limit: 1000000,
      balance: 0,
    },
    {
      id: 4,
      limit: 10000000,
      balance: 0,
    },
    {
      id: 5,
      limit: 500000,
      balance: 0,
    },
  ])
}

export default load
