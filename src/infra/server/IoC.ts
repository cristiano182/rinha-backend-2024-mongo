import CreateTransaction from '../../usecases/client/CreateTransaction'
import ListTransaction from '../../usecases/client/ListTransaction'
import { Container } from 'inversify'
import 'reflect-metadata'
import TYPES from './Types'

export default class IoC {
  public constructor(
    private container: Container = new Container({ skipBaseClassChecks: true }),
  ) {}

  getContainer(): Container {
    return this.container
  }

  async build(): Promise<void> {
    await this.bindUsecases()
  }

  async bindUsecases(): Promise<void> {
    this.container.bind(TYPES.ListTransaction).to(ListTransaction)
    this.container.bind(TYPES.CreateTransaction).to(CreateTransaction)
  }
}
