import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques utilisateur' })
  async getUserStats(@Param('id') id: string) {
    const stats = await this.usersService.getUserStats(id);
    if (!stats) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return stats;
  }
}