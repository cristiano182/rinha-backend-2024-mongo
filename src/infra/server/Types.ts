const TYPES = {
  Container: Symbol.for('Container'),

  CreateTransaction: Symbol.for('CreateTransaction'),
  ListTransaction: Symbol.for('ListTransaction'),

  ClientRepository: Symbol.for('ClientRepository'),

  CreateTransactionController: Symbol.for('CreateTransactionController'),
  ListTransactionController: Symbol.for('ListTransactionController'),

  MongoDBConnection: Symbol.for('MongoDBConnection'),
}

export default TYPES
