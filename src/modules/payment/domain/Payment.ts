export type PaymentId = number;

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

export interface IPaymentProps {
  id: PaymentId;
  budgetId: number;
  externalId?: string | null;
  amount: number;
  status: PaymentStatus;
  method?: string | null;
  payerEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentEntity {
  private constructor(private props: IPaymentProps) {}

  static create(input: Omit<IPaymentProps, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: PaymentStatus }): PaymentEntity {
    return new PaymentEntity({
      id: 0,
      budgetId: input.budgetId,
      externalId: input.externalId ?? null,
      amount: input.amount,
      status: input.status ?? 'pending',
      method: input.method ?? null,
      payerEmail: input.payerEmail ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: IPaymentProps): PaymentEntity {
    return new PaymentEntity(props);
  }

  get id(): PaymentId {
    return this.props.id;
  }

  get budgetId(): number {
    return this.props.budgetId;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  approve(): void {
    this.props.status = 'approved';
    this.props.updatedAt = new Date();
  }

  reject(): void {
    this.props.status = 'rejected';
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  refund(): void {
    this.props.status = 'refunded';
    this.props.updatedAt = new Date();
  }

  toJSON(): IPaymentProps {
    return { ...this.props };
  }
}
