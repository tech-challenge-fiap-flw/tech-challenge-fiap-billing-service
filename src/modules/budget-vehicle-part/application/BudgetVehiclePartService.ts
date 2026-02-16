import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart'
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository'

export type CreateBudgetVehiclePartInput = {
  budgetId: number
  parts: {
    vehiclePartId: number
    quantity: number
  }[]
}

export type UpdateBudgetVehiclePartInput = {
  id: number
  quantity: number
  vehiclePartId: number
}[]

export type RemoveBudgetVehiclePartInput = {
  ids: number[]
}

export type BudgetVehiclePartOutput = ReturnType<BudgetVehiclePartEntity['toJSON']>

export interface IBudgetVehiclePartService {
  createMany(input: CreateBudgetVehiclePartInput): Promise<BudgetVehiclePartOutput[]>
  listByBudget(budgetId: number): Promise<BudgetVehiclePartOutput[]>
  updateMany(items: UpdateBudgetVehiclePartInput): Promise<void>
  removeMany(input: RemoveBudgetVehiclePartInput): Promise<void>
}

export class BudgetVehiclePartService implements IBudgetVehiclePartService {
  constructor(private readonly repo: IBudgetVehiclePartRepository) {}

  async createMany(input: CreateBudgetVehiclePartInput): Promise<BudgetVehiclePartOutput[]> {
    const entities = input.parts.map(part => 
      BudgetVehiclePartEntity.create({
        budgetId: input.budgetId,
        vehiclePartId: part.vehiclePartId,
        quantity: part.quantity
      })
    )

    const created = await this.repo.bulkCreate(entities)

    return created.map(c => {
      return c.toJSON()
    })
  }

  async listByBudget(budgetId: number): Promise<BudgetVehiclePartOutput[]> {
    const rows = await this.repo.listByBudget(budgetId)

    return rows.map(r => {
      return r.toJSON()
    })
  }

  async updateMany(items: UpdateBudgetVehiclePartInput): Promise<void> {
    for (const item of items) {
      await this.repo.updateQuantity(item.id, item.quantity)
    }
  }

  async removeMany(input: RemoveBudgetVehiclePartInput): Promise<void> {
    await this.repo.deleteByIds(input.ids)
  }
}
