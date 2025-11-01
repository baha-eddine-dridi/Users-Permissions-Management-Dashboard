@echo off
REM Script de démarrage rapide pour Windows

echo 🚀 Démarrage du projet Users ^& Permissions Dashboard...

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker détecté
    
    REM Option 1: Démarrage avec Docker (recommandé)
    echo 🐳 Démarrage avec Docker Compose...
    docker-compose up -d mongodb
    
    echo ⏳ Attente de la base de données MongoDB ^(10 secondes^)...
    timeout /t 10 /nobreak >nul
    
    echo 🌱 Exécution du seed de la base de données...
    cd server
    npm run seed
    cd ..
    
    echo 🚀 Démarrage des services...
    docker-compose up
) else (
    echo ⚠️ Docker non détecté, démarrage manuel...
    
    REM Option 2: Démarrage manuel
    echo 📦 Installation des dépendances...
    npm install
    
    echo 🗄️ Assurez-vous que MongoDB est en cours d'exécution sur localhost:27017
    echo 💡 Vous pouvez démarrer MongoDB avec: docker run -d -p 27017:27017 mongo:latest
    
    pause
    
    echo 🌱 Exécution du seed de la base de données...
    npm run seed
    
    echo 🚀 Démarrage du serveur de développement...
    npm run dev
)

pause
