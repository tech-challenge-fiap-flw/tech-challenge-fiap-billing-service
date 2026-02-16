export type VehicleServiceId = number;

export interface VehicleServiceProps {
  id?: VehicleServiceId;
  name: string;
  price: number;
  description?: string | null;
  deletedAt?: Date | null;
}

export class VehicleServiceEntity {
  private props: VehicleServiceProps;
  private constructor(props: VehicleServiceProps) { this.props = props; }
  static create(input: Omit<VehicleServiceProps, 'id' | 'deletedAt'>) {
    return new VehicleServiceEntity({ ...input, deletedAt: null });
  }
  static restore(props: VehicleServiceProps) { return new VehicleServiceEntity(props); }
  toJSON(): VehicleServiceProps { return { ...this.props }; }
}
