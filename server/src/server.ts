import { App } from './app';

/**
 * Point d'entrée de l'application
 */
async function bootstrap() {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage:', error);
    process.exit(1);
  }
}

// Démarrer l'application
bootstrap();
