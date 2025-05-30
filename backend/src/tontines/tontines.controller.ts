// backend/src/tontines/tontines.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { TontinesService } from './tontines.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { TontineStatus } from './enums/tontine-status.enum';

// TODO: Remplacer par votre vrai guard d'authentification
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tontines')
// @UseGuards(JwtAuthGuard) // Décommentez quand vous aurez le guard JWT
export class TontinesController {
  constructor(private readonly tontinesService: TontinesService) {}

  // POST /api/tontines - Créer une nouvelle tontine
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTontineDto: CreateTontineDto,
    @Request() req: any // TODO: Typer avec votre interface utilisateur
  ) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le JWT
      // const userId = req.user.id;
      const userId = 'temp_user_123'; // Temporaire pour les tests

      const tontine = await this.tontinesService.create(createTontineDto, userId);

      return {
        success: true,
        message: 'Tontine créée avec succès',
        data: tontine
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // GET /api/tontines - Lister les tontines
  @Get()
  async findAll(
    @Request() req: any,
    @Query('status') status?: TontineStatus,
    @Query('my') my?: string // ?my=true pour les tontines de l'utilisateur
  ) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le JWT
      // const userId = req.user.id;
      const userId = 'temp_user_123'; // Temporaire

      const filters: any = {};
      
      if (status) {
        filters.status = status;
      }
      
      if (my === 'true') {
        filters.creatorId = userId;
      }

      const tontines = await this.tontinesService.findAll(filters);

      return {
        success: true,
        message: 'Tontines récupérées avec succès',
        data: tontines
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // GET /api/tontines/stats - Statistiques utilisateur
  @Get('stats')
  async getStats(@Request() req: any) {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le JWT
      const userId = 'temp_user_123'; // Temporaire

      const stats = await this.tontinesService.getStats(userId);

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // GET /api/tontines/:id - Récupérer une tontine par ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const tontine = await this.tontinesService.findOne(id);

      return {
        success: true,
        message: 'Tontine récupérée avec succès',
        data: tontine
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // PUT /api/tontines/:id/status - Mettre à jour le statut
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TontineStatus,
    @Request() req: any
  ) {
    try {
      const userId = 'temp_user_123'; // Temporaire

      const tontine = await this.tontinesService.updateStatus(id, status, userId);

      return {
        success: true,
        message: 'Statut mis à jour avec succès',
        data: tontine
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // DELETE /api/tontines/:id - Supprimer une tontine
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = 'temp_user_123'; // Temporaire

      await this.tontinesService.remove(id, userId);

      return {
        success: true,
        message: 'Tontine supprimée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}