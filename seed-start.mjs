import { pathToFileURL } from 'node:url';
import { register } from 'node:module';

try {
  // Enregistrez le loader `ts-node/esm`
  register('ts-node/esm', pathToFileURL('./'));

  // Importez et exécutez le script de seed
  await import('./prisma/seed.ts');
} catch (err) {
  console.error('Error during seeding:', err);
  process.exit(1);
}
