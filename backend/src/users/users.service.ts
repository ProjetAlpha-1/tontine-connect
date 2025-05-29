import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  async getUserStats(userId: string) {
    // Simulation d'un utilisateur pour les tests
    if (userId === 'test-user-id') {
      return {
        id: userId,
        phone: '+241062345678',
        name: 'Jean Nguema (Test)',
        email: 'jean@example.com',
        reputationScore: 75,
        trustLevel: 'SILVER',
        trustLevelInfo: {
          name: 'Argent',
          color: '#a0aec0',
          icon: '🥈'
        },
        isVerified: true,
        lastLoginAt: new Date(),
        memberSince: new Date('2025-01-01'),
      };
    }

    throw new NotFoundException('Utilisateur non trouvé');
  }
}