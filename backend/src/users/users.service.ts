import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 🚀 MÉTHODE AJOUTÉE - Récupère tous les utilisateurs depuis PostgreSQL
  async findAll() {
    const users = await this.usersRepository.find({
      select: [
        'id',
        'phone', 
        'name',
        'email',
        'isVerified',
        'reputationScore',
        'trustLevel',
        'avatar',
        'lastLoginAt',
        'createdAt',
        'isActive'
      ],
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });

    // Ajouter les informations de trustLevel pour chaque utilisateur
    return users.map(user => ({
      ...user,
      trustLevelInfo: user.getTrustLevelInfo()
    }));
  }

  // ✅ NOUVELLE MÉTHODE - Récupérer utilisateur par ID
  async findOneById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'phone',
        'name',
        'email',
        'isVerified',
        'reputationScore',
        'trustLevel',
        'avatar',
        'lastLoginAt',
        'createdAt',
        'isActive'
      ]
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Retourner avec trustLevelInfo comme dans findAll()
    return {
      ...user,
      trustLevelInfo: user.getTrustLevelInfo()
    };
  }

  // 🔧 MÉTHODE CORRIGÉE - Utilise les vraies données PostgreSQL
  async getUserStats(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'phone',
        'name', 
        'email',
        'reputationScore',
        'trustLevel',
        'isVerified',
        'lastLoginAt',
        'createdAt'
      ]
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Retourner les stats avec informations enrichies
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      reputationScore: user.reputationScore,
      trustLevel: user.trustLevel,
      trustLevelInfo: user.getTrustLevelInfo(),
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      memberSince: user.createdAt,
    };
  }
}