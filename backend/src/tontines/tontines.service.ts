// backend/src/tontines/tontines.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { TontineStatus } from './enums/tontine-status.enum';
import { TontineRules } from './interfaces/tontine-rules.interface';

// Interface pour notre modèle Tontine (temporaire, sans DB)
export interface Tontine {
  id: string;
  name: string;
  description: string;
  objective: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  maxParticipants: number;
  minParticipants: number;
  enrollmentDeadline: Date;
  plannedStartDate: Date;
  status: TontineStatus;
  creatorId: string;
  rules: TontineRules;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TontinesService {
  // Stockage en mémoire (temporaire, sans DB)
  private tontines: Tontine[] = [];
  private currentId = 1;

  // Créer une nouvelle tontine
  async create(createTontineDto: CreateTontineDto, creatorId: string): Promise<Tontine> {
    // Validation des dates
    const enrollmentDeadline = new Date(createTontineDto.enrollmentDeadline);
    const plannedStartDate = new Date(createTontineDto.plannedStartDate);
    const now = new Date();

    if (enrollmentDeadline <= now) {
      throw new BadRequestException('La date limite d\'inscription doit être dans le futur');
    }

    if (plannedStartDate <= enrollmentDeadline) {
      throw new BadRequestException('La date de début doit être après la date limite d\'inscription');
    }

    // Validation de la cohérence des participants
    if (createTontineDto.minParticipants > createTontineDto.maxParticipants) {
      throw new BadRequestException('Le nombre minimum de participants ne peut pas être supérieur au maximum');
    }

    // Validation de la pénalité
    if (createTontineDto.rules.penaltyAmount && createTontineDto.rules.penaltyAmount > createTontineDto.contributionAmount) {
      throw new BadRequestException('La pénalité ne peut pas être supérieure au montant de contribution');
    }

    // Création de la tontine
    const tontine: Tontine = {
      id: this.generateId(),
      name: createTontineDto.name,
      description: createTontineDto.description,
      objective: createTontineDto.objective,
      contributionAmount: createTontineDto.contributionAmount,
      frequency: createTontineDto.frequency,
      maxParticipants: createTontineDto.maxParticipants,
      minParticipants: createTontineDto.minParticipants,
      enrollmentDeadline: enrollmentDeadline,
      plannedStartDate: plannedStartDate,
      status: TontineStatus.DRAFT,
      creatorId: creatorId,
      rules: {
        penaltyAmount: createTontineDto.rules.penaltyAmount || 0,
        gracePeriodDays: createTontineDto.rules.gracePeriodDays,
        allowEarlyWithdrawal: createTontineDto.rules.allowEarlyWithdrawal,
        orderDeterminationMethod: createTontineDto.rules.orderDeterminationMethod,
        minimumReputationScore: createTontineDto.rules.minimumReputationScore || 1
      },
      createdAt: now,
      updatedAt: now
    };

    // Sauvegarder en mémoire
    this.tontines.push(tontine);

    console.log('Tontine créée:', {
      id: tontine.id,
      name: tontine.name,
      status: tontine.status,
      creatorId: tontine.creatorId
    });

    return tontine;
  }

  // Récupérer toutes les tontines (avec filtres optionnels)
  async findAll(filters?: {
    creatorId?: string;
    status?: TontineStatus;
    participantId?: string;
  }): Promise<Tontine[]> {
    let result = [...this.tontines];

    if (filters) {
      if (filters.creatorId) {
        result = result.filter(t => t.creatorId === filters.creatorId);
      }
      if (filters.status) {
        result = result.filter(t => t.status === filters.status);
      }
      // Note: participantId nécessitera la table des participations plus tard
    }

    return result;
  }

  // Récupérer une tontine par ID
  async findOne(id: string): Promise<Tontine> {
    const tontine = this.tontines.find(t => t.id === id);
    if (!tontine) {
      throw new NotFoundException(`Tontine avec l'ID ${id} introuvable`);
    }
    return tontine;
  }

  // Mettre à jour le statut d'une tontine
  async updateStatus(id: string, status: TontineStatus, userId: string): Promise<Tontine> {
    const tontine = await this.findOne(id);

    // Vérifier que l'utilisateur est le créateur
    if (tontine.creatorId !== userId) {
      throw new BadRequestException('Seul le créateur peut modifier le statut de la tontine');
    }

    // Validation des transitions de statut
    if (!this.isValidStatusTransition(tontine.status, status)) {
      throw new BadRequestException(`Transition de statut invalide: ${tontine.status} -> ${status}`);
    }

    // Mettre à jour
    tontine.status = status;
    tontine.updatedAt = new Date();

    console.log('Statut tontine mis à jour:', {
      id: tontine.id,
      oldStatus: tontine.status,
      newStatus: status
    });

    return tontine;
  }

  // Supprimer une tontine (seulement si en draft)
  async remove(id: string, userId: string): Promise<void> {
    const tontine = await this.findOne(id);

    if (tontine.creatorId !== userId) {
      throw new BadRequestException('Seul le créateur peut supprimer la tontine');
    }

    if (tontine.status !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seules les tontines en brouillon peuvent être supprimées');
    }

    const index = this.tontines.findIndex(t => t.id === id);
    this.tontines.splice(index, 1);

    console.log('Tontine supprimée:', { id, userId });
  }

  // Méthodes utilitaires privées
  private generateId(): string {
    return `tontine_${Date.now()}_${this.currentId++}`;
  }

  private isValidStatusTransition(currentStatus: TontineStatus, newStatus: TontineStatus): boolean {
    const validTransitions: Record<TontineStatus, TontineStatus[]> = {
      [TontineStatus.DRAFT]: [TontineStatus.ENROLLMENT, TontineStatus.CANCELLED],
      [TontineStatus.ENROLLMENT]: [TontineStatus.CONFIGURATION, TontineStatus.CANCELLED],
      [TontineStatus.CONFIGURATION]: [TontineStatus.ACTIVE, TontineStatus.CANCELLED],
      [TontineStatus.ACTIVE]: [TontineStatus.PAUSED, TontineStatus.COMPLETED],
      [TontineStatus.PAUSED]: [TontineStatus.ACTIVE, TontineStatus.CANCELLED],
      [TontineStatus.COMPLETED]: [], // État final
      [TontineStatus.CANCELLED]: [] // État final
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // Méthodes pour les statistiques (pour le dashboard)
  async getStats(userId: string) {
    const userTontines = this.tontines.filter(t => t.creatorId === userId);
    
    return {
      total: userTontines.length,
      active: userTontines.filter(t => t.status === TontineStatus.ACTIVE).length,
      draft: userTontines.filter(t => t.status === TontineStatus.DRAFT).length,
      completed: userTontines.filter(t => t.status === TontineStatus.COMPLETED).length,
    };
  }
} 
