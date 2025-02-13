const { metricsEndpoint, recordHttpRequest, client } = require('../src/metrics');

describe('Module Metrics', () => {
  // Réinitialiser les métriques avant chaque test
  beforeEach(() => {
    client.register.resetMetrics();
  });

  describe('recordHttpRequest', () => {
    it('doit incrémenter le compteur http_requests_total avec les bons labels', async () => {
      // Incrémente le compteur pour une requête GET sur /test avec status 200
      recordHttpRequest('GET', '/test', 200);

      // Récupère les métriques sous forme de JSON
      const metricsArray = await client.register.getMetricsAsJSON();
      const httpMetric = metricsArray.find(metric => metric.name === 'http_requests_total');

      // Recherche une entrée avec les labels correspondants
      const valueEntry = httpMetric.values.find(entry =>
        entry.labels.method === 'GET' &&
        entry.labels.route === '/test' &&
        (entry.labels.status_code === "200" || entry.labels.status_code === 200)
      );
      expect(valueEntry).toBeDefined();
      expect(valueEntry.value).toBe(1);
    });
  });

  describe('metricsEndpoint', () => {
    let req, res;
    beforeEach(() => {
      req = {};
      res = {
        set: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
    });

    it('doit renvoyer les métriques en cas de succès', async () => {
      // Incrémente une métrique pour avoir des données
      recordHttpRequest('POST', '/test', 201);

      await metricsEndpoint(req, res);

      // Vérifie que le Content-Type est défini correctement
      expect(res.set).toHaveBeenCalledWith("Content-Type", client.register.contentType);
      // Vérifie que la réponse contient les métriques
      expect(res.end).toHaveBeenCalled();
      const metricsText = res.end.mock.calls[0][0];
      expect(metricsText).toContain('http_requests_total');
    });

    it('doit renvoyer une erreur 500 en cas d’erreur', async () => {
      jest.spyOn(client.register, 'metrics').mockRejectedValue(new Error('Erreur simulée'));

      await metricsEndpoint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.end).toHaveBeenCalledWith('Erreur simulée');
      client.register.metrics.mockRestore();
    });
  });
});
