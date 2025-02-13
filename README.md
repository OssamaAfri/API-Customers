# API-Costumers

## Présentation

API-Costumers est une API REST conçue pour la gestion des clients dans le cadre d'un système de microservices. Ce projet permet de réaliser des opérations de création, lecture, mise à jour et suppression (CRUD) des clients. L'API est sécurisée grâce aux JSON Web Tokens (JWT) et monitorée via Prometheus et Grafana.

## Fonctionnalités

- **CRUD des clients** : Création, lecture, mise à jour et suppression des données clients.
- **Sécurisation** : Authentification basée sur JWT.
- **Monitoring** : Exposition d'un endpoint `/metrics` au format Prometheus pour la collecte de métriques (nombre de requêtes, temps de réponse, etc.).
- **CI/CD** : Pipeline d'intégration continue configuré avec GitHub Actions pour automatiser les tests et la construction de l'image Docker.

## Technologies utilisées

- **Backend** : Node.js, Express
- **Base de données** : MongoDB avec Mongoose
- **Message Broker** : RabbitMQ
- **Sécurité** : JSON Web Tokens (JWT) et bcrypt pour le hachage des mots de passe
- **Monitoring** : prom-client, Prometheus, Grafana
- **Conteneurisation** : Docker, Docker Compose
- **CI/CD** : GitHub Actions

## Installation

1. **Cloner le dépôt**  

        git clone https://github.com/OssamaAfri/API-Costumers.git

2. **Rendez-vous dans le dossier du projet**

        cd API-Costumers

3. **Installez les dépendances**

        npm install

4. **Créez un fichier .env (voir l'exemple .env.example fourni) et configurez les variables d'environnement**

        NODE_ENV=development
        PORT= (Port Choisi pour l'api)
        MONGO_URI= (URL Mongodb)
        RABBITMQ_URI= (URL RabbitMQ)
        JWT_SECRET= (code secret)
        SKIP_RABBITMQ=false

5. **Créez un fichier .env.test avec les mêmes variables mais avec un petit changement**

        NODE_ENV=test
        SKIP_RABBITMQ=true

## Conteneurisation

**Après avoir installé les dépendances et configuré vos variables d'environnement, lancez**

        docker-compose up --build

Pour : Construire l'image Docker pour l'API si nécessaire.
       Lancer les conteneurs pour l'API, MongoDB et RabbitMQ.
       Vous permettre de tester l'ensemble de la solution en local.

## Tester

**Pour lancer les tests**

        npm test

## Exécution

**Pour lancer l'API en développement**

        npm start