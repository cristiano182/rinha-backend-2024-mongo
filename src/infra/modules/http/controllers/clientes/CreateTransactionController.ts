import 'reflect-metadata'

import Ajv from 'ajv'
import { Request, Response, Server } from 'hyper-express'
import { inject, injectable } from 'inversify'
import UnprocessableEntityException from '../../../../../domain/exceptions/UnprocessableEntityException'
import { TransactionType } from '../../../../../domain/transaction'
import CreateTransaction from '../../../../../usecases/client/CreateTransaction'
import { IController } from '../../../../interfaces/IController'
import TYPES from '../../../../server/Types'
import { CreateTransactionSchema } from './schemas/CreateTransactionSchema'

interface ICreateTransactionParams {
  client_id: number
  valor: number
  tipo: TransactionType
  descricao: string
}

@injectable()
export default class CreateTransactionController implements IController {
  constructor(
    @inject(TYPES.CreateTransaction)
    private createTransaction: CreateTransaction,
  ) {}
  private ajv = new Ajv()

  async execute(httpInstance: Server): Promise<Server> {
    return httpInstance.post(
      '/clientes/:client_id/transacoes',
      async (request: Request, response: Response) => {
        const body = await request.json()

        const params: ICreateTransactionParams = {
          ...body,
          client_id: +request.path_parameters.client_id,
        }

        const validate = this.ajv.compile(CreateTransactionSchema)

        const valid = validate(params)
        if (!valid)
          throw new UnprocessableEntityException(
            JSON.stringify(validate.errors),
          )

        const { client_id, valor, tipo, descricao } = params

        const payload = {
          client_id,
          amount: valor,
          type: tipo,
          description: descricao,
        }
        const client = await this.createTransaction.execute(payload)
        const result = {
          limite: client.limit,
          saldo: client.balance,
        }
        return response.status(200).json(result)
      },
    )
  }
}
