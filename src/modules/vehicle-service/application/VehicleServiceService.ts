import { NotFoundServerException } from '../../../shared/application/ServerException';
import { VehicleServiceEntity, VehicleServiceProps } from '../domain/VehicleService';
import { VehicleServiceRepository } from '../domain/VehicleServiceRepository';

export type CreateVehicleServiceInput = Omit<VehicleServiceProps, 'id' | 'deletedAt'>;
export type VehicleServiceOutput = ReturnType<VehicleServiceEntity['toJSON']>;

export interface IVehicleServiceService {
  createVehicleService(input: CreateVehicleServiceInput): Promise<VehicleServiceOutput>;
  updateVehicleService(id: number, partial: Partial<CreateVehicleServiceInput>): Promise<VehicleServiceOutput>;
  deleteVehicleService(id: number): Promise<void>;
  findById(id: number): Promise<VehicleServiceOutput>;
  findByIds(ids: number[]): Promise<VehicleServiceOutput[]>;
  list(offset: number, limit: number): Promise<VehicleServiceOutput[]>;
  countAll(): Promise<number>;
}

export class VehicleServiceService implements IVehicleServiceService {
  constructor(private readonly repo: VehicleServiceRepository) {}

  async createVehicleService(input: CreateVehicleServiceInput): Promise<VehicleServiceOutput> {
    const entity = VehicleServiceEntity.create(input);
    const created = await this.repo.create(entity);
    return created.toJSON();
  }

  async updateVehicleService(id: number, partial: Partial<CreateVehicleServiceInput>): Promise<VehicleServiceOutput> {
    const updated = await this.repo.update(id, partial);

    if (!updated) {
      throw new NotFoundServerException('Vehicle service not found');
    }

    return updated.toJSON();
  }

  async deleteVehicleService(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  async findById(id: number): Promise<VehicleServiceOutput> {
    const vehicleService = await this.repo.findById(id);

    if (!vehicleService) {
      throw new NotFoundServerException('Vehicle service not found');
    }

    return vehicleService.toJSON();
  }

  async findByIds(ids: number[]): Promise<VehicleServiceOutput[]> {
    const results: VehicleServiceOutput[] = [];

    for (const id of ids) {
      const item = await this.repo.findById(id);

      if (item) {
        results.push(item.toJSON());
      }
    }

    return results;
  }

  async list(offset: number, limit: number): Promise<VehicleServiceOutput[]> {
    const items = await this.repo.list(offset, limit);
    return items.map(i => i.toJSON());
  }

  async countAll(): Promise<number> {
    return this.repo.countAll();
  }
}
