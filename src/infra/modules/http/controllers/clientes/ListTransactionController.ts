import 'reflect-metadata'

import Ajv from 'ajv'
import { Request, Response, Server } from 'hyper-express'
import { inject, injectable } from 'inversify'
import UnprocessableEntityException from '../../../../../domain/exceptions/UnprocessableEntityException'
import ListTransaction from '../../../../../usecases/client/ListTransaction'
import { IController } from '../../../../interfaces/IController'
import TYPES from '../../../../server/Types'
import { ListTransactionSchema } from './schemas/ListTransactionSchema'
import { ITransaction } from '@domain/transaction'

@injectable()
export default class ListTransactionController implements IController {
  constructor(
    @inject(TYPES.ListTransaction) private listTransaction: ListTransaction,
  ) {}
  private ajv = new Ajv()

  async execute(httpInstance: Server): Promise<Server> {
    return httpInstance.get(
      '/clientes/:client_id/extrato',
      async (request: Request, response: Response) => {
        const validate = this.ajv.compile(ListTransactionSchema)

        const params = { client_id: +request.path_parameters.client_id }

        const valid = validate(params)

        if (!valid) throw new UnprocessableEntityException('')

        const data = await this.listTransaction.execute(params)

        const result = {
          saldo: {
            total: data[0]?.balance,
            data_extrato: new Date().toISOString(),
            limite: data[0]?.limit,
          },
          ultimas_transacoes: data?.map(({ transactions: obj }: any) => {
            return {
              valor: obj?.amount,
              tipo: obj?.type,
              descricao: obj?.description,
              realizada_em: obj?.created_at
                ? new Date(obj.created_at).toISOString()
                : null,
            }
          }),
        }
        return response.status(200).json(result)
      },
    )
  }
}
