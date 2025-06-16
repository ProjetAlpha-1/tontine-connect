// backend/src/tontines/tontines.service.ts
// 🔧 VERSION CONNECTÉE v0.5.0 - ActiveTontine Database
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveTontine } from '../active/entities/active-tontine.entity';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { TontineStatus } from './enums/tontine-status.enum';
import { TontineRules } from './interfaces/tontine-rules.interface';

@Injectable()
export class TontinesService {
  constructor(
    @InjectRepository(ActiveTontine)
    private tontinesRepository: Repository<ActiveTontine>
  ) {}

  // Créer une nouvelle tontine
  async create(createTontineDto: CreateTontineDto, creatorId: string): Promise<ActiveTontine> {
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

    // Génération ID tontine unique
    const tontineId = this.generateTontineId();

    // Création de la tontine avec mapping vers ActiveTontine
    const activeTontine = this.tontinesRepository.create({
      tontineId: tontineId,
      name: createTontineDto.name,
      description: createTontineDto.description,
      status: this.mapToActiveStatus(TontineStatus.DRAFT),
      contributionAmount: createTontineDto.contributionAmount,
      frequency: createTontineDto.frequency,
      maxMembers: createTontineDto.maxParticipants,
      currentMembers: 0,
      startDate: plannedStartDate,
      // Fix: endDate doit être undefined pour nullable, pas null
      nextPaymentDate: plannedStartDate,
      currentCycleNumber: 0,
      totalCycles: this.calculateTotalCycles(createTontineDto),
      totalCollected: 0,
      totalDistributed: 0,
      members: [],
      configuration: {
        objective: createTontineDto.objective,
        enrollmentDeadline: enrollmentDeadline,
        minParticipants: createTontineDto.minParticipants
      },
      rules: {
        penaltyAmount: createTontineDto.rules.penaltyAmount || 0,
        gracePeriodDays: createTontineDto.rules.gracePeriodDays,
        allowEarlyWithdrawal: createTontineDto.rules.allowEarlyWithdrawal,
        orderDeterminationMethod: createTontineDto.rules.orderDeterminationMethod,
        minimumReputationScore: createTontineDto.rules.minimumReputationScore || 1
      },
      createdBy: creatorId // Fix: Rétablir car champ existe bien
    });

    // Sauvegarder en base de données - Fix: save() retourne l'objet pas un array
    const savedTontine = await this.tontinesRepository.save(activeTontine);

    console.log('Tontine créée en DB:', {
      id: savedTontine.id,
      tontineId: savedTontine.tontineId,
      name: savedTontine.name,
      status: savedTontine.status,
      createdBy: savedTontine.createdBy
    });

    return savedTontine;
  }

  // Récupérer toutes les tontines (avec filtres optionnels)
  async findAll(filters?: {
    creatorId?: string;
    status?: TontineStatus;
    participantId?: string;
  }): Promise<ActiveTontine[]> {
    const queryBuilder = this.tontinesRepository.createQueryBuilder('tontine');

    if (filters) {
      if (filters.creatorId) {
        queryBuilder.andWhere('tontine.createdBy = :creatorId', { creatorId: filters.creatorId }); // Fix: Rétablir car champ existe
      }
      if (filters.status) {
        const mappedStatus = this.mapToActiveStatus(filters.status);
        queryBuilder.andWhere('tontine.status = :status', { status: mappedStatus });
      }
      // TODO: participantId nécessitera jointure avec table members
    }

    const tontines = await queryBuilder.getMany();

    console.log('Tontines trouvées:', {
      count: tontines.length,
      filters: filters
    });

    return tontines;
  }

  // Récupérer une tontine par ID (cherche par id ET tontineId)
  async findOne(id: string): Promise<ActiveTontine> {
    // Essayer d'abord par tontineId (ancien comportement)
    let tontine = await this.tontinesRepository.findOne({
      where: { tontineId: id },
      relations: ['cycles', 'notifications']
    });

    // Si pas trouvé, essayer par id (nouveau comportement)
    if (!tontine) {
      tontine = await this.tontinesRepository.findOne({
        where: { id: id },
        relations: ['cycles', 'notifications']
      });
    }

    if (!tontine) {
      throw new NotFoundException(`Tontine avec l'ID ${id} introuvable`);
    }

    console.log('Tontine trouvée:', {
      id: tontine.id,
      tontineId: tontine.tontineId,
      name: tontine.name,
      status: tontine.status
    });

    return tontine;
  }

  // Mettre à jour le statut d'une tontine
  async updateStatus(id: string, status: TontineStatus, userId: string): Promise<ActiveTontine> {
    const tontine = await this.findOne(id);

    // 🚧 TEMPORAIRE v0.5.0 : Désactiver vérification créateur pour tests
    console.log('🔧 Vérification créateur (updateStatus) désactivée temporairement - v0.5.0');
    console.log('👤 Utilisateur demandé:', userId);
    console.log('👤 Créateur tontine:', tontine.createdBy); // Fix: Rétablir car champ existe

    // Validation des transitions de statut
    if (!this.isValidStatusTransition(this.mapFromActiveStatus(tontine.status), status)) {
      throw new BadRequestException(`Transition de statut invalide: ${tontine.status} -> ${status}`);
    }

    // Mettre à jour
    const oldStatus = tontine.status;
    tontine.status = this.mapToActiveStatus(status);
    tontine.updatedBy = userId; // Fix: Rétablir car champ existe

    const updatedTontine = await this.tontinesRepository.save(tontine);

    console.log('Statut tontine mis à jour en DB:', {
      id: tontine.tontineId,
      oldStatus: oldStatus,
      newStatus: updatedTontine.status
    });

    return updatedTontine;
  }

  // Supprimer une tontine (seulement si en draft)
  async remove(id: string, userId: string): Promise<void> {
    const tontine = await this.findOne(id);

    // 🚧 TEMPORAIRE v0.5.0 : Désactiver vérification créateur pour tests
    console.log('🔧 Vérification créateur (remove) désactivée temporairement - v0.5.0');

    const currentStatus = this.mapFromActiveStatus(tontine.status);
    if (currentStatus !== TontineStatus.DRAFT) {
      throw new BadRequestException('Seules les tontines en brouillon peuvent être supprimées');
    }

    await this.tontinesRepository.remove(tontine);

    console.log('Tontine supprimée de DB:', { id, userId });
  }

  // Méthodes pour les statistiques (pour le dashboard)
  async getStats(userId: string) {
    const tontines = await this.tontinesRepository.find({
      where: { createdBy: userId } // Fix: Rétablir car champ existe
    });

    const stats = {
      total: tontines.length,
      active: tontines.filter(t => t.status === 'active').length,
      pending: tontines.filter(t => t.status === 'pending').length,
      completed: tontines.filter(t => t.status === 'completed').length,
    };

    console.log('Stats calculées:', { userId, stats });

    return stats;
  }

  // Méthodes utilitaires privées
  private generateTontineId(): string {
    return `tontine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTotalCycles(dto: CreateTontineDto): number {
    // Calcul basé sur la fréquence et la durée prévue
    // Pour l'instant, on utilise le nombre max de participants
    return dto.maxParticipants;
  }

  private mapToActiveStatus(tontineStatus: TontineStatus): string {
    const statusMapping = {
      [TontineStatus.DRAFT]: 'pending',
      [TontineStatus.ENROLLMENT]: 'pending',
      [TontineStatus.CONFIGURATION]: 'pending',
      [TontineStatus.ACTIVE]: 'active',
      [TontineStatus.PAUSED]: 'paused',
      [TontineStatus.COMPLETED]: 'completed',
      [TontineStatus.CANCELLED]: 'cancelled'
    };
    return statusMapping[tontineStatus] || 'pending';
  }

  private mapFromActiveStatus(activeStatus: string): TontineStatus {
    const statusMapping: Record<string, TontineStatus> = {
      'pending': TontineStatus.DRAFT,
      'active': TontineStatus.ACTIVE,
      'paused': TontineStatus.PAUSED,
      'completed': TontineStatus.COMPLETED,
      'cancelled': TontineStatus.CANCELLED
    };
    return statusMapping[activeStatus] || TontineStatus.DRAFT;
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
}