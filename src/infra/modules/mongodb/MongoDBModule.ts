import 'reflect-metadata'
import { Container, injectable } from 'inversify'
import { MongoClient } from 'mongodb'
import Module from '../../interfaces/IModule'
import TYPES from '../../server/Types'
import ClientRepository from '../mongodb/repositories/ClientRepository'
import { mongoConfig } from './configs/config'
import load from './configs/init'

@injectable()
export default class MongoDBModule extends Module {
  private client = new MongoClient(mongoConfig.host)

  static async build(container: Container): Promise<MongoDBModule> {
    const module = new MongoDBModule(container)
    await module.configurations()
    return module
  }

  async stop(): Promise<void> {
    await this.client.close()
  }

  async configurations(): Promise<void> {
    await this.client.connect()
    await load(this.client)
    this.container
      .bind<MongoClient>(TYPES.MongoDBConnection)
      .toConstantValue(this.client)
  }

  async start(): Promise<void> {
    this.container.bind(TYPES.ClientRepository).to(ClientRepository)
  }
}
