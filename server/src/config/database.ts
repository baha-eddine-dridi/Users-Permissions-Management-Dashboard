import mongoose from 'mongoose';
import { config } from './env';

/**
 * Classe pour gérer la connexion à MongoDB
 */
export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Obtenir l'instance singleton de la base de données
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Connecter à MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Base de données déjà connectée');
      return;
    }

    try {
      await mongoose.connect(config.mongodbUri, {
        // Options de connexion pour MongoDB
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });

      this.isConnected = true;
      console.log('✅ Base de données connectée avec succès');

      // Gérer les événements de connexion
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erreur de base de données:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Base de données déconnectée');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 Base de données reconnectée');
        this.isConnected = true;
      });

      // Gérer l'arrêt gracieux
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error);
      throw error;
    }
  }

  /**
   * Déconnecter de MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📴 Base de données déconnectée');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'état de la connexion
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Obtenir les informations de la base de données
   */
  public getDatabaseInfo() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}
