import { Controller, Get, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🚀 ROUTE AJOUTÉE - Liste tous les utilisateurs
  @Get()
  @ApiOperation({ summary: 'Obtenir la liste de tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  async findAll() {
    return await this.usersService.findAll();
  }

  // ✅ CORRECTION: Ajouter GET /:id AVANT :id/stats
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with trust level info' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneById(id);
  }

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