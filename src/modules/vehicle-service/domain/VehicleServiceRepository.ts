import { VehicleServiceEntity, VehicleServiceId, VehicleServiceProps } from './VehicleService';

export interface VehicleServiceRepository {
  create(service: VehicleServiceEntity): Promise<VehicleServiceEntity>;
  findById(id: VehicleServiceId): Promise<VehicleServiceEntity | null>;
  update(id: VehicleServiceId, partial: Partial<VehicleServiceProps>): Promise<VehicleServiceEntity | null>;
  softDelete(id: VehicleServiceId): Promise<void>;
  list(offset: number, limit: number): Promise<VehicleServiceEntity[]>;
  countAll(): Promise<number>;
}
