export type BudgetVehiclePartId = number;

export interface BudgetVehiclePartProps {
  id: BudgetVehiclePartId;
  budgetId: number;
  vehiclePartId: number;
  quantity: number;
}

export class BudgetVehiclePartEntity {
  private constructor(private readonly props: BudgetVehiclePartProps) {}

  static create(input: Omit<BudgetVehiclePartProps, 'id'>) {
    return new BudgetVehiclePartEntity({
      id: 0,
      budgetId: input.budgetId,
      vehiclePartId: input.vehiclePartId,
      quantity: input.quantity,
    });
  }

  static restore(props: BudgetVehiclePartProps) {
    return new BudgetVehiclePartEntity(props);
  }

  toJSON() {
    return { ...this.props };
  }
}
