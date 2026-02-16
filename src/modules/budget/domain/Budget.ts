export type BudgetId = number;

export interface BudgetProps {
  id: BudgetId;
  description: string;
  ownerId: number;
  diagnosisId: number;
  total: number;
  creationDate: Date;
  deletedAt?: Date | null;
}

export class BudgetEntity {
  private constructor(private readonly props: BudgetProps) {}

  static create(input: Omit<BudgetProps, 'id' | 'creationDate' | 'deletedAt' | 'total'> & { total?: number }) {
    return new BudgetEntity({
      id: 0,
      description: input.description,
      ownerId: input.ownerId,
      diagnosisId: input.diagnosisId,
      total: input.total ?? 0,
      creationDate: new Date(),
      deletedAt: null,
    });
  }

  static restore(props: BudgetProps) {
    return new BudgetEntity(props);
  }

  toJSON() {
    return { ...this.props };
  }
}
