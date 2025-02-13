const express = require('express');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/auth');
const { connectRabbitMQ } = require('./services/rabbitService');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { metricsEndpoint, recordHttpRequest } = require('./metrics');
require('dotenv').config();

const app = express();

// sécuriser les headers HTTP
app.use(helmet());

// Limitation des requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, veuillez réessayer après 15 minutes."
});
app.use(limiter);

app.use(express.json());

// Connexion à la base de données
connectDB();

// Connexion à RabbitMQ
connectRabbitMQ();

// Middleware pour enregistrer les métriques de chaque requête
app.use((req, res, next) => {
  res.on('finish', () => {
    recordHttpRequest(req.method, req.path, res.statusCode);
  });
  next();
});

// Exposer l'endpoint pour les métriques
app.get('/metrics', metricsEndpoint);

// Routes publiques pour l'authentification
app.use('/auth', authRoutes);

// Routes protégées par le middleware d'authentification JWT
app.use('/customers', authMiddleware, customerRoutes);

// Ne démarrer le serveur que si ce module est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}


module.exports = app;
