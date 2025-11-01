import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Import configuration
import { config, validateConfig, isDevelopment } from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';

// Import database
import { Database } from './config/database';

/**
 * Interface pour les erreurs personnalisées
 */
interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

/**
 * Classe principale de l'application Express
 */
export class App {
  public app: Application;
  private port: number;

  constructor() {
    // Valider la configuration
    validateConfig();
    
    this.app = express();
    this.port = config.port;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialiser les middlewares
   */
  private initializeMiddlewares(): void {
    // Sécurité
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'], // Accepter les deux ports
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }));

    // Logging
    if (!isDevelopment()) {
      this.app.use(morgan('combined'));
    }

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser(config.cookieSecret));

    // Headers de sécurité supplémentaires
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  /**
   * Initialiser les routes
   */
  private initializeRoutes(): void {
    // Route racine avec informations API
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'API Users & Permissions - Gestion RBAC',
        version: '1.0.0',
        environment: config.nodeEnv,
        endpoints: {
          health: '/health',
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            refresh: 'POST /api/auth/refresh',
            forgotPassword: 'POST /api/auth/forgot-password',
            resetPassword: 'POST /api/auth/reset-password',
            verifyEmail: 'POST /api/auth/verify-email',
          },
          users: {
            getAll: 'GET /api/users',
            getById: 'GET /api/users/:id',
            create: 'POST /api/users',
            update: 'PUT /api/users/:id',
            delete: 'DELETE /api/users/:id',
          },
          roles: {
            getAll: 'GET /api/roles',
            getById: 'GET /api/roles/:id',
            create: 'POST /api/roles',
            update: 'PUT /api/roles/:id',
            delete: 'DELETE /api/roles/:id',
          },
        },
        documentation: {
          health: 'GET /health - Vérifier l\'état du serveur',
          auth: 'Authentification et gestion des utilisateurs',
          rbac: 'Système de contrôle d\'accès basé sur les rôles',
        },
      });
    });

    // Route de santé
    this.app.get('/health', (_req: Request, res: Response) => {
      const db = Database.getInstance();
      
      res.status(200).json({
        success: true,
        message: 'Serveur opérationnel',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: db.getDatabaseInfo(),
      });
    });

    // Routes API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/roles', roleRoutes);

    // Route 404
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} non trouvée`,
      });
    });
  }

  /**
   * Initialiser la gestion des erreurs
   */
  private initializeErrorHandling(): void {
    // Gestionnaire d'erreurs global
    this.app.use((error: CustomError, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Erreur capturée:', error);

      // Erreur de validation Mongoose
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: Object.values((error as any).errors).map((err: any) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      // Erreur de duplication MongoDB
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Ressource déjà existante',
        });
      }

      // Erreur CastError (ID invalide)
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID invalide',
        });
      }

      // Erreur JSON malformé
      if (error.name === 'SyntaxError' && 'body' in error) {
        return res.status(400).json({
          success: false,
          message: 'JSON malformé',
        });
      }

      // Erreur personnalisée
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Erreur interne du serveur';

      return res.status(statusCode).json({
        success: false,
        message,
        ...(isDevelopment() && { stack: error.stack }),
      });
    });

    // Gestion des promesses non capturées
    process.on('unhandledRejection', (reason: any) => {
      console.error('Promesse non capturée:', reason);
      // En production, on pourrait vouloir arrêter le serveur
      if (!isDevelopment()) {
        process.exit(1);
      }
    });

    // Gestion des exceptions non capturées
    process.on('uncaughtException', (error: Error) => {
      console.error('Exception non capturée:', error);
      process.exit(1);
    });
  }

  /**
   * Démarrer le serveur
   */
  public async start(): Promise<void> {
    try {
      // Connecter à la base de données
      const db = Database.getInstance();
      await db.connect();

      // Démarrer le serveur
      this.app.listen(this.port, () => {
        console.log(`🚀 Serveur démarré sur le port ${this.port}`);
        console.log(`📊 Environnement: ${config.nodeEnv}`);
        console.log(`🌐 URL: http://localhost:${this.port}`);
        console.log(`📚 API Docs: http://localhost:${this.port}/health`);
      });

    } catch (error) {
      console.error('❌ Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  }

  /**
   * Arrêter le serveur gracieusement
   */
  public async stop(): Promise<void> {
    try {
      const db = Database.getInstance();
      await db.disconnect();
      console.log('🛑 Serveur arrêté gracieusement');
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du serveur:', error);
    }
  }
}
