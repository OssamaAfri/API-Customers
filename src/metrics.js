const client = require('prom-client');

// Collecte automatique des métriques de Node.js (mémoire, CPU, etc.)
client.collectDefaultMetrics();

// Création d'un compteur pour le nombre total de requêtes HTTP
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code']
});

// Fonction pour incrémenter le compteur (à utiliser dans un middleware)
const recordHttpRequest = (method, route, statusCode) => {
  httpRequestCounter.labels(method, route, statusCode).inc();
};

// Middleware pour exposer les métriques à Prometheus
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
};

module.exports = { recordHttpRequest, metricsEndpoint, client };
