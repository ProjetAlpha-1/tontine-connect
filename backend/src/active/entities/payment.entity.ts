import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cycle } from './cycle.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cycleId: string;

  @Column('uuid')
  memberId: string;

  @Column()
  memberName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  expectedAmount: number;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'failed', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedDate: Date;

  @Column({ nullable: true })
  confirmedBy: string;

  @Column({ type: 'enum', enum: ['cash', 'mobile_money', 'bank_transfer', 'card', 'other'], nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionReference: string;

  @Column({ nullable: true })
  externalTransactionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalties: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'json', nullable: true })
  proof: any; // Photos, receipts, etc.

  @Column({ type: 'boolean', default: false })
  isLate: boolean;

  @Column({ type: 'int', default: 0 })
  daysLate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  latePenalty: number;

  @Column({ type: 'boolean', default: false })
  isPartial: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingAmount: number;

  @Column({ type: 'int', default: 1 })
  attempt: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAttemptDate: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  // Additional properties needed by the service
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ type: 'uuid', nullable: true })
  penaltyId: string;

  // Relations
  @ManyToOne(() => Cycle, cycle => cycle.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleId' })
  cycle: Cycle;

  // Metadata
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  // Computed properties
  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  // Compatibility properties for existing service code
  get method(): string {
    return this.paymentMethod;
  }

  set method(value: string) {
    this.paymentMethod = value;
  }

  get reference(): string {
    return this.transactionReference;
  }

  set reference(value: string) {
    this.transactionReference = value;
  }

  get member(): any {
    return {
      name: this.memberName,
      id: this.memberId
    };
  }

  get isOverdue(): boolean {
    return new Date() > this.dueDate && this.status === 'pending';
  }

  get daysSinceDue(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysUntilDue(): number {
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get totalAmount(): number {
    return this.amount + this.fees + this.penalties + this.latePenalty;
  }

  get completionPercentage(): number {
    if (this.expectedAmount === 0) return 0;
    return Math.round((this.amount / this.expectedAmount) * 100);
  }

  get hasProof(): boolean {
    return this.proof && Object.keys(this.proof).length > 0;
  }

  get riskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isOverdue) {
      if (this.daysSinceDue > 7) return 'critical';
      if (this.daysSinceDue > 3) return 'high';
      return 'medium';
    }
    return 'low';
  }

  get statusColor(): string {
    switch (this.status) {
      case 'confirmed': return 'green';
      case 'pending': return this.isOverdue ? 'red' : 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  }
}