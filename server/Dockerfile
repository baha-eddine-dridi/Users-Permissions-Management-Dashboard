# Dockerfile pour le serveur Express.js
FROM node:18-alpine AS base

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de configuration des packages
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Étape de développement
FROM base AS development

# Installer toutes les dépendances (dev incluses)
RUN npm ci

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5000

# Commande de développement
CMD ["npm", "run", "dev"]

# Étape de build
FROM base AS builder

# Installer toutes les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS production

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Copier les fichiers de configuration
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers buildés
COPY --from=builder --chown=express:nodejs /app/dist ./dist

# Changer vers l'utilisateur non-root
USER express

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de production
CMD ["node", "dist/server.js"]
