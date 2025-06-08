// backend/src/database/seeds/run-seed.ts
import { runSeed } from './seed';

console.log('🚀 TontineConnect - Seed Script Runner');
console.log('=====================================');

runSeed()
  .then(() => {
    console.log('🎉 Seed terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 
