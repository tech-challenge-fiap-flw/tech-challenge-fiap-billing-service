export type BudgetVehicleServiceId = number;

export interface IBudgetVehicleServiceProps {
  id?: BudgetVehicleServiceId;
  budgetId: number;
  vehicleServiceId: number;
  price?: number;
}

export class BudgetVehicleServiceEntity {
  private props: IBudgetVehicleServiceProps;

  private constructor(props: IBudgetVehicleServiceProps) {
    this.props = props;
  }

  static create(props: IBudgetVehicleServiceProps): BudgetVehicleServiceEntity {
    return new BudgetVehicleServiceEntity({
      ...props,
      price: props.price ?? 0,
    });
  }

  static restore(props: IBudgetVehicleServiceProps): BudgetVehicleServiceEntity {
    return new BudgetVehicleServiceEntity(props);
  }

  toJSON(): IBudgetVehicleServiceProps {
    return { ...this.props };
  }
}
