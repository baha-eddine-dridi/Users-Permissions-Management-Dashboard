#!/bin/bash

# Script de démarrage rapide pour le projet Users & Permissions Dashboard

echo "🚀 Démarrage du projet Users & Permissions Dashboard..."

# Vérifier si Docker est installé et en cours d'exécution
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "✅ Docker détecté et en cours d'exécution"
    
    # Option 1: Démarrage avec Docker (recommandé)
    echo "🐳 Démarrage avec Docker Compose..."
    docker-compose up -d mongodb
    
    echo "⏳ Attente de la base de données MongoDB (10 secondes)..."
    sleep 10
    
    echo "🌱 Exécution du seed de la base de données..."
    cd server && npm run seed && cd ..
    
    echo "🚀 Démarrage des services..."
    docker-compose up
else
    echo "⚠️ Docker non détecté, démarrage manuel..."
    
    # Option 2: Démarrage manuel
    echo "📦 Installation des dépendances..."
    npm install
    
    echo "🗄️ Assurez-vous que MongoDB est en cours d'exécution sur localhost:27017"
    echo "💡 Vous pouvez démarrer MongoDB avec: docker run -d -p 27017:27017 mongo:latest"
    
    read -p "Appuyez sur Entrée quand MongoDB est prêt..."
    
    echo "🌱 Exécution du seed de la base de données..."
    npm run seed
    
    echo "🚀 Démarrage du serveur de développement..."
    npm run dev
fi
