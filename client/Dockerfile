# Dockerfile pour le client React
FROM node:18-alpine AS base

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de configuration des packages
COPY package*.json ./

# Installation des dépendances
RUN npm ci && npm cache clean --force

# Étape de développement
FROM base AS development

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Étape de build
FROM base AS builder

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Commande de production
CMD ["nginx", "-g", "daemon off;"]
