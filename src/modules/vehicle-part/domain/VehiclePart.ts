export type VehiclePartId = number;

export interface VehiclePartProps {
  id?: VehiclePartId;
  type: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  deletedAt?: Date | null;
  creationDate?: Date | null;
}

export class VehiclePartEntity {
  private props: VehiclePartProps;
  private constructor(props: VehiclePartProps) { this.props = props; }
  static create(input: Omit<VehiclePartProps, 'id' | 'deletedAt' | 'creationDate'>) {
    return new VehiclePartEntity({ ...input, deletedAt: null, creationDate: new Date() });
  }
  static restore(props: VehiclePartProps) { return new VehiclePartEntity(props); }
  toJSON(): VehiclePartProps { return { ...this.props }; }
}
