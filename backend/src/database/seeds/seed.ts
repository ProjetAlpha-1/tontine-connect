// backend/src/database/seeds/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

// Import des entités
import { User, TrustLevel } from '../../users/entities/user.entity';
import { ActiveTontine } from '../../active/entities/active-tontine.entity';
import { Cycle } from '../../active/entities/cycle.entity';
import { Payment } from '../../active/entities/payment.entity';
import { Notification } from '../../active/entities/notification.entity';

// Import des services
import { ActiveService } from '../../active/active.service';
import { ReputationService } from '../../reputation/reputation.service';

async function bootstrap() {
  console.log('🌱 Démarrage du seed script...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get<DataSource>(getDataSourceToken());
  const activeService = app.get<ActiveService>(ActiveService);
  const reputationService = app.get<ReputationService>(ReputationService);

  try {
    // Nettoyage des données existantes
    await cleanDatabase(dataSource);
    
    // Création des données de seed
    const users = await createUsers(dataSource);
    const tontines = await createTontines(dataSource, users);
    const cycles = await createCycles(dataSource, tontines, users);
    const payments = await createPayments(dataSource, users, cycles);
    
    // Test du workflow révolutionnaire
    await testWorkflow(activeService, reputationService, users[0].id, tontines[0].id);
    
    console.log('✅ Seed terminé avec succès !');
    console.log(`📊 Créé: ${users.length} utilisateurs, ${tontines.length} tontines, ${cycles.length} cycles, ${payments.length} paiements`);
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await app.close();
  }
}

async function cleanDatabase(dataSource: DataSource) {
  console.log('🧹 Nettoyage de la base de données...');
  
  // Ordre important pour respecter les contraintes FK
  await dataSource.query('DELETE FROM payments');
  await dataSource.query('DELETE FROM penalties');
  await dataSource.query('DELETE FROM notifications');
  await dataSource.query('DELETE FROM cycles');
  await dataSource.query('DELETE FROM active_tontines');
  await dataSource.query('DELETE FROM user_reputations');
  await dataSource.query('DELETE FROM user_reputations_test');
  await dataSource.query('DELETE FROM users');
  
  console.log('✅ Base de données nettoyée');
}

async function createUsers(dataSource: DataSource): Promise<User[]> {
  console.log('👥 Création des utilisateurs...');
  
  const userRepository = dataSource.getRepository(User);
  
  const usersData = [
    {
      id: uuidv4(),
      email: 'marie.tontine@gmail.com',
      phone: '+237670123456',
      name: 'Marie Mballa',
      isVerified: true,
      trustLevel: TrustLevel.GOLD,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: uuidv4(),
      email: 'paul.savings@gmail.com',
      phone: '+237680234567',
      name: 'Paul Ngono',
      isVerified: true,
      trustLevel: TrustLevel.SILVER,
      createdAt: new Date('2024-01-20'),
    },
    {
      id: uuidv4(),
      email: 'fatou.epargne@gmail.com',
      phone: '+237690345678',
      name: 'Fatou Diallo',
      isVerified: true,
      trustLevel: TrustLevel.GOLD,
      createdAt: new Date('2024-02-01'),
    },
    {
      id: uuidv4(),
      email: 'david.money@gmail.com',
      phone: '+237655456789',
      name: 'David Biko',
      isVerified: false,
      trustLevel: TrustLevel.BRONZE,
      createdAt: new Date('2024-02-10'),
    }
  ];

  const users = [];
  for (const userData of usersData) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    users.push(user);
  }
  
  console.log(`✅ ${users.length} utilisateurs créés`);
  return users;
}

async function createTontines(dataSource: DataSource, users: User[]): Promise<ActiveTontine[]> {
  console.log('🏦 Création des tontines...');
  
  const tontines = [];
  
  // Méthode directe SQL pour éviter le problème TypeORM
  const tontine1Id = uuidv4();
  const tontineId1 = uuidv4();
  
  await dataSource.query(`
    INSERT INTO active_tontines (
      id, "tontineId", name, description, status, "contributionAmount", 
      frequency, "maxMembers", "totalCycles", "startDate", "endDate", 
      "cycleInterval", "paymentInterval", "createdAt", "createdBy"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    )
  `, [
    tontine1Id, tontineId1, 'Tontine Famille Mballa', 
    'Épargne familiale pour projets communs', 'active', 50000,
    'weekly', 4, 4, '2024-03-01', '2024-06-30',
    'monthly', 'weekly', '2024-02-15', users[0].id
  ]);
  
  const tontine2Id = uuidv4();
  const tontineId2 = uuidv4();
  
  await dataSource.query(`
    INSERT INTO active_tontines (
      id, "tontineId", name, description, status, "contributionAmount", 
      frequency, "maxMembers", "totalCycles", "startDate", "endDate", 
      "cycleInterval", "paymentInterval", "createdAt", "createdBy"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    )
  `, [
    tontine2Id, tontineId2, 'Tontine Entrepreneurs Douala', 
    'Financement de projets entrepreneuriaux', 'pending', 100000,
    'weekly', 3, 3, '2024-06-10', '2024-09-10',
    'weekly', 'weekly', '2024-06-01', users[1].id
  ]);
  
  // Récupération des entités créées
  const tontineRepository = dataSource.getRepository(ActiveTontine);
  const tontine1 = await tontineRepository.findOne({ where: { id: tontine1Id } });
  const tontine2 = await tontineRepository.findOne({ where: { id: tontine2Id } });
  
  if (!tontine1 || !tontine2) {
    throw new Error('Erreur lors de la création des tontines');
  }
  
  tontines.push(tontine1, tontine2);
  
  console.log(`✅ ${tontines.length} tontines créées`);
  return tontines;
}

async function createCycles(dataSource: DataSource, tontines: ActiveTontine[], users: User[]): Promise<Cycle[]> {
  console.log('🔄 Création des cycles...');
  
  const cycleRepository = dataSource.getRepository(Cycle);
  
  const cyclesData = [
    {
      id: uuidv4(),
      activeTontineId: tontines[0].id,
      cycleNumber: 1,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      beneficiaryId: users[0].id,
      expectedAmount: 200000,
      status: 'completed',
      distributionMethod: 'manual',
      createdAt: new Date('2024-03-01'),
    },
    {
      id: uuidv4(),
      activeTontineId: tontines[0].id,
      cycleNumber: 2,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-30'),
      beneficiaryId: users[1].id,
      expectedAmount: 200000,
      status: 'completed',
      distributionMethod: 'automatic',
      createdAt: new Date('2024-04-01'),
    },
    {
      id: uuidv4(),
      activeTontineId: tontines[0].id,
      cycleNumber: 3,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-31'),
      beneficiaryId: users[2].id,
      expectedAmount: 200000,
      status: 'active',
      distributionMethod: 'manual',
      createdAt: new Date('2024-05-01'),
    }
  ];

  const cycles = [];
  for (const cycleData of cyclesData) {
    const cycle = cycleRepository.create(cycleData);
    await cycleRepository.save(cycle);
    cycles.push(cycle);
  }
  
  console.log(`✅ ${cycles.length} cycles créés`);
  return cycles;
}

async function createPayments(dataSource: DataSource, users: User[], cycles: Cycle[]): Promise<Payment[]> {
  console.log('💰 Création des paiements...');
  
  const paymentRepository = dataSource.getRepository(Payment);
  
      const paymentsData = [
    // Cycle 1 - Mars - TOUS PAYÉS
    {
      id: uuidv4(),
      cycleId: cycles[0].id,
      memberId: users[0].id,      // ✅ AJOUTÉ: memberId obligatoire - Marie
      memberName: users[0].name,  // ✅ AJOUTÉ: memberName obligatoire - "Marie Mballa"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-03-07'),
      status: 'confirmed',        // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'mobile_money', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'medium',         // ✅ CORRIGÉ: enum PostgreSQL
    },
    {
      id: uuidv4(),
      cycleId: cycles[0].id,
      memberId: users[1].id,      // ✅ AJOUTÉ: memberId obligatoire - Paul
      memberName: users[1].name,  // ✅ AJOUTÉ: memberName obligatoire - "Paul Ngono"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-03-07'),
      status: 'confirmed',        // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'bank_transfer', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'medium',         // ✅ CORRIGÉ: enum PostgreSQL
    },
    {
      id: uuidv4(),
      cycleId: cycles[0].id,
      memberId: users[2].id,      // ✅ AJOUTÉ: memberId obligatoire - Fatou
      memberName: users[2].name,  // ✅ AJOUTÉ: memberName obligatoire - "Fatou Diallo"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-03-07'),
      status: 'confirmed',        // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'mobile_money', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'high',           // ✅ CORRIGÉ: enum PostgreSQL
    },
    {
      id: uuidv4(),
      cycleId: cycles[0].id,
      memberId: users[3].id,      // ✅ AJOUTÉ: memberId obligatoire - David
      memberName: users[3].name,  // ✅ AJOUTÉ: memberName obligatoire - "David Biko"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-03-07'),
      status: 'confirmed',        // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'cash',      // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'low',            // ✅ CORRIGÉ: enum PostgreSQL
    },
    // Cycle 3 - Mai - EN COURS
    {
      id: uuidv4(),
      cycleId: cycles[2].id,
      memberId: users[0].id,      // ✅ AJOUTÉ: memberId obligatoire - Marie
      memberName: users[0].name,  // ✅ AJOUTÉ: memberName obligatoire - "Marie Mballa"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-05-07'),
      status: 'confirmed',        // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'mobile_money', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'high',           // ✅ CORRIGÉ: enum PostgreSQL
    },
    {
      id: uuidv4(),
      cycleId: cycles[2].id,
      memberId: users[1].id,      // ✅ AJOUTÉ: memberId obligatoire - Paul
      memberName: users[1].name,  // ✅ AJOUTÉ: memberName obligatoire - "Paul Ngono"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-05-07'),
      status: 'pending',          // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'bank_transfer', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'medium',         // ✅ CORRIGÉ: enum PostgreSQL
    },
    {
      id: uuidv4(),
      cycleId: cycles[2].id,
      memberId: users[3].id,      // ✅ AJOUTÉ: memberId obligatoire - David
      memberName: users[3].name,  // ✅ AJOUTÉ: memberName obligatoire - "David Biko"
      amount: 50000,
      expectedAmount: 50000,      // ✅ AJOUTÉ: expectedAmount obligatoire
      dueDate: new Date('2024-05-07'),
      status: 'failed',           // ✅ CORRIGÉ: enum PostgreSQL
      paymentMethod: 'mobile_money', // ✅ CORRIGÉ: enum PostgreSQL
      priority: 'urgent',         // ✅ CORRIGÉ: enum PostgreSQL
    }
  ];

  const payments = [];
  for (const paymentData of paymentsData) {
    const payment = paymentRepository.create(paymentData);
    await paymentRepository.save(payment);
    payments.push(payment);
  }
  
  console.log(`✅ ${payments.length} paiements créés`);
  return payments;
}

async function testWorkflow(
  activeService: ActiveService, 
  reputationService: ReputationService, 
  userId: string, 
  tontineId: string
) {
  console.log('🧪 Test du workflow révolutionnaire...');
  
  try {
    // Test 1: Événement paiement à temps
    const eventResult = await reputationService.recordEvent({
      userId: userId,
      eventType: 'PAYMENT_ON_TIME',
      tontineId: tontineId,
      eventData: {
        amount: 50000,
        currency: 'FCFA',
        method: 'mobile_money'
      },
      description: 'Paiement cycle 3 - Marie Mballa',
      businessContext: 'Cycle 3, Semaine 1'
    });
    
    console.log('✅ Événement réputation enregistré');
    
    // Test 2: Vérification du score
    const userReputation = await reputationService.getUserReputation(userId);
    console.log('✅ Score réputation calculé:', userReputation.score);
    
    console.log('🎯 Workflow Active ↔ Reputation validé !');
    
  } catch (error) {
    console.error('❌ Erreur dans le workflow:', error.message);
  }
}

// Exécution du script
if (require.main === module) {
  bootstrap();
}

export { bootstrap as runSeed };