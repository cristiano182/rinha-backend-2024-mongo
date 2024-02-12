import 'reflect-metadata'
import { Container } from 'inversify'
import HttpModule from '../modules/http/HttpModule'
import MongoDBModule from '../modules/mongodb/MongoDBModule'
import IoC from './IoC'
import TYPES from './Types'

const POOL_SIZE = 2
process.env.UV_THREADPOOL_SIZE = `${POOL_SIZE}`

async function run(): Promise<void> {
  const ioc = new IoC()
  await ioc.build()

  const container = ioc.getContainer()
  container.bind<Container>(TYPES.Container).toConstantValue(container)

  const mongoInstance = await MongoDBModule.build(ioc.getContainer())
  await mongoInstance.start()

  const httpInstance = await HttpModule.build(ioc.getContainer())
  await httpInstance.start()
}
;(async () => {
  await run()
})()
