import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Cycle } from './cycle.entity';
import { Notification } from './notification.entity';

@Entity('active_tontines')
export class ActiveTontine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tontineId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'active', 'paused', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  contributionAmount: number;

  @Column()
  frequency: string; // 'weekly', 'monthly', 'bi-weekly'

  @Column({ type: 'int' })
  maxMembers: number;

  @Column({ type: 'int', default: 0 })
  currentMembers: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDate: Date;

  @Column({ type: 'int', default: 0 })
  currentCycleNumber: number;

  @Column({ type: 'int' })
  totalCycles: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCollected: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDistributed: number;

  @Column({ type: 'json', nullable: true })
  members: any[];

  @Column({ type: 'json', nullable: true })
  configuration: any;

  @Column({ type: 'json', nullable: true })
  rules: any;

  // Additional properties needed by the service
  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly'], default: 'weekly' })
  cycleInterval: string;

  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly'], default: 'weekly' })
  paymentInterval: string;

  // Relations
  @OneToMany(() => Cycle, cycle => cycle.activeTontine, { cascade: true })
  cycles: Cycle[];

  @OneToMany(() => Notification, notification => notification.activeTontine, { cascade: true })
  notifications: Notification[];

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
  get completionPercentage(): number {
    if (this.totalCycles === 0) return 0;
    return Math.round((this.currentCycleNumber / this.totalCycles) * 100);
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get averageContribution(): number {
    if (this.currentMembers === 0) return 0;
    return this.totalCollected / this.currentMembers;
  }
}