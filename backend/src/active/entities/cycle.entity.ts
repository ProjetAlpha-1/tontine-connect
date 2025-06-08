import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ActiveTontine } from './active-tontine.entity';
import { Payment } from './payment.entity';
import { Penalty } from './penalty.entity';

@Entity('cycles')
export class Cycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  activeTontineId: string;

  @Column({ type: 'int' })
  cycleNumber: number;

  @Column({ type: 'enum', enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  collectedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  distributedAmount: number;

  @Column({ type: 'uuid', nullable: true })
  beneficiaryId: string;

  @Column({ nullable: true })
  beneficiaryName: string;

  @Column({ type: 'int', default: 0 })
  totalPayments: number;

  @Column({ type: 'int', default: 0 })
  completedPayments: number;

  @Column({ type: 'int', default: 0 })
  pendingPayments: number;

  @Column({ type: 'int', default: 0 })
  overduePayments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ type: 'timestamp', nullable: true })
  distributionDate: Date;

  @Column({ type: 'enum', enum: ['manual', 'automatic'], default: 'manual' })
  distributionMethod: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'json', nullable: true })
  statistics: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Additional properties needed by the service
  @Column({ type: 'int', default: 0 })
  participatingMembers: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  // Relations
  @ManyToOne(() => ActiveTontine, activeTontine => activeTontine.cycles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activeTontineId' })
  activeTontine: ActiveTontine;

  @OneToMany(() => Payment, payment => payment.cycle, { cascade: true })
  payments: Payment[];

  @OneToMany(() => Penalty, penalty => penalty.cycle, { cascade: true })
  penalties: Penalty[];

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
  get isActive(): boolean {
    return this.status === 'active';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  // Compatibility properties for existing service code
  get number(): number {
    return this.cycleNumber;
  }

  get payeeId(): string {
    return this.beneficiaryId;
  }

  get payeeName(): string {
    return this.beneficiaryName;
  }

  get tontineId(): string {
    return this.activeTontineId;
  }

  get paymentCompletionPercentage(): number {
    if (this.totalPayments === 0) return 0;
    return Math.round((this.completedPayments / this.totalPayments) * 100);
  }

  get amountCompletionPercentage(): number {
    if (this.expectedAmount === 0) return 0;
    return Math.round((this.collectedAmount / this.expectedAmount) * 100);
  }

  get isOverdue(): boolean {
    return new Date() > this.endDate && this.status !== 'completed';
  }

  get daysRemaining(): number {
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysOverdue(): number {
    if (!this.isOverdue) return 0;
    const now = new Date();
    const diffTime = now.getTime() - this.endDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get healthScore(): number {
    // Score basé sur le taux de completion et les retards
    const completionScore = this.paymentCompletionPercentage;
    const timelinessScore = this.isOverdue ? Math.max(0, 100 - (this.daysOverdue * 10)) : 100;
    return Math.round((completionScore + timelinessScore) / 2);
  }
}