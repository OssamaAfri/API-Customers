# Utiliser une image Node.js officielle
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l’application
COPY . .

# Exposer le port (celui défini dans .env, ici 3000 par défaut)
EXPOSE 3000

# Démarrer l’application
CMD ["npm", "start"]
