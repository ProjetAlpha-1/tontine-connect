import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cycle } from './cycle.entity';

@Entity('penalties')
export class Penalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cycleId: string;

  @Column('uuid')
  memberId: string;

  @Column()
  memberName: string;

  @Column({ type: 'enum', enum: ['late_payment', 'missed_payment', 'violation', 'absence', 'other'] })
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['pending', 'applied', 'paid', 'waived', 'disputed'], default: 'pending' })
  status: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  incidentDate: Date;

  @Column({ type: 'timestamp' })
  appliedDate: Date;

  @Column()
  appliedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidDate: Date;

  @Column({ nullable: true })
  paidBy: string;

  @Column({ type: 'timestamp', nullable: true })
  waivedDate: Date;

  @Column({ nullable: true })
  waivedBy: string;

  @Column({ type: 'text', nullable: true })
  waiverReason: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  severity: string;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'int', default: 1 })
  occurrence: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulatedAmount: number;

  @Column({ type: 'json', nullable: true })
  evidence: any; // Photos, documents, etc.

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'text', nullable: true })
  memberResponse: string;

  @Column({ type: 'boolean', default: false })
 

  @Column({ type: 'timestamp', nullable: true })
  disputeDate: Date;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ type: 'enum', enum: ['pending', 'reviewing', 'resolved', 'rejected'], nullable: true })
  disputeStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  disputeResolvedDate: Date;

  @Column({ nullable: true })
  disputeResolvedBy: string;

  @Column({ type: 'text', nullable: true })
  disputeResolution: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  affectsReputation: boolean;

  @Column({ type: 'int', default: 0 })
  reputationImpact: number;

  // Relations
  @ManyToOne(() => Cycle, cycle => cycle.penalties, { onDelete: 'CASCADE' })
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

  get isApplied(): boolean {
    return this.status === 'applied';
  }

  get isPaid(): boolean {
    return this.status === 'paid';
  }

  get isWaived(): boolean {
    return this.status === 'waived';
  }

  get isDisputed(): boolean {
    return this.status === 'disputed';
  }

  get isOverdue(): boolean {
    return this.dueDate && new Date() > this.dueDate && this.status === 'applied';
  }

  get daysSinceApplied(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.appliedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysUntilDue(): number {
    if (!this.dueDate) return 0;
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysSinceDue(): number {
    if (!this.isOverdue) return 0;
    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get severityLevel(): number {
    switch (this.severity) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 2;
    }
  }

  get statusColor(): string {
    switch (this.status) {
      case 'paid': return 'green';
      case 'waived': return 'blue';
      case 'pending': return 'orange';
      case 'applied': return this.isOverdue ? 'red' : 'yellow';
      case 'disputed': return 'purple';
      default: return 'gray';
    }
  }

  get typeLabel(): string {
    switch (this.type) {
      case 'late_payment': return 'Paiement en retard';
      case 'missed_payment': return 'Paiement manqué';
      case 'violation': return 'Violation des règles';
      case 'absence': return 'Absence';
      case 'other': return 'Autre';
      default: return this.type;
    }
  }

  get hasEvidence(): boolean {
    return this.evidence && Object.keys(this.evidence).length > 0;
  }
} 
