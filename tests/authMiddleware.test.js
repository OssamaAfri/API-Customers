const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/auth');

if (!process.env.JWT_SECRET) {
  require('dotenv').config({ path: '.env.test' });
}

let req, res, next;
beforeEach(() => {
  req = { headers: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  next = jest.fn();
});

describe('authMiddleware', () => {
  it('doit appeler next si le token est valide', () => {
    const token = jwt.sign({ id: '12345', username: 'user1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('doit renvoyer 401 si l\'en-tête Authorization est manquant', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès non autorisé : Token manquant' });
  });

  it('doit renvoyer 401 si le token est absent dans l\'en-tête', () => {
    req.headers.authorization = 'Bearer ';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès non autorisé : Format de token incorrect' });
  });

  it('doit renvoyer 401 si le token est invalide', () => {
    req.headers.authorization = 'Bearer invalide';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès non autorisé : Token invalide' });
  });
});
