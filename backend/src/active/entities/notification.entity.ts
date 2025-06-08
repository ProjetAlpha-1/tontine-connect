import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ActiveTontine } from './active-tontine.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  activeTontineId: string;

  @Column('uuid')
  recipientId: string;

  @Column()
  recipientName: string;

  @Column({ type: 'enum', enum: ['email', 'sms', 'push', 'in_app'] })
  channel: string;

  @Column({ type: 'enum', enum: ['payment_reminder', 'payment_confirmed', 'payment_overdue', 'cycle_started', 'cycle_completed', 'penalty_applied', 'penalty_reminder', 'member_joined', 'member_left', 'tontine_completed', 'system', 'other'] })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any; // Additional data for the notification

  @Column({ type: 'enum', enum: ['normal', 'high', 'urgent'], default: 'normal' })
  priority: string;

  @Column({ type: 'enum', enum: ['pending', 'sent', 'delivered', 'failed', 'read'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'json', nullable: true })
  template: any; // Template data used to generate the notification

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
 
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'text', nullable: true })
  externalId: string; // ID from external service (SMS provider, email service, etc.)

  @Column({ type: 'json', nullable: true })
  actions: any; // Action buttons/links in the notification

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  tags: string; // Comma-separated tags

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  requiresAction: boolean;

  @Column({ type: 'text', nullable: true })
  actionUrl: string;

  @Column({ type: 'json', nullable: true })
  trackingData: any; // For analytics

  // Relations
  @ManyToOne(() => ActiveTontine, activeTontine => activeTontine.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activeTontineId' })
  activeTontine: ActiveTontine;

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

  get isSent(): boolean {
    return this.status === 'sent';
  }

  get isDelivered(): boolean {
    return this.status === 'delivered';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  get isRead(): boolean {
    return this.status === 'read';
  }

  get canRetry(): boolean {
    return this.isFailed && this.retryCount < this.maxRetries;
  }

  get isExpired(): boolean {
    return this.expiresAt && new Date() > this.expiresAt;
  }

  get isHighPriority(): boolean {
    return this.priority === 'high';
  }

  get isUrgent(): boolean {
    return this.priority === 'urgent';
  }

  get daysSinceSent(): number {
    if (!this.sentAt) return 0;
    const now = new Date();
    const diffTime = now.getTime() - this.sentAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get hoursUntilExpiry(): number {
    if (!this.expiresAt) return 0;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  get statusColor(): string {
    switch (this.status) {
      case 'delivered': 
      case 'read': return 'green';
      case 'sent': return 'blue';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  }

  get priorityColor(): string {
    switch (this.priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      default: return 'gray';
    }
  }

  get typeIcon(): string {
    switch (this.type) {
      case 'payment_reminder': return '💰';
      case 'payment_confirmed': return '✅';
      case 'payment_overdue': return '⚠️';
      case 'cycle_started': return '🚀';
      case 'cycle_completed': return '🎉';
      case 'penalty_applied': return '⛔';
      case 'member_joined': return '👋';
      case 'member_left': return '👋';
      case 'tontine_completed': return '🏆';
      case 'system': return '⚙️';
      default: return '📢';
    }
  }

  get hasActions(): boolean {
    return this.actions && Array.isArray(this.actions) && this.actions.length > 0;
  }
}