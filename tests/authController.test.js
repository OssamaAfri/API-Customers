const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');

if (!process.env.JWT_SECRET) {
  require('dotenv').config({ path: '.env.test' });
}

describe('POST /auth/login', () => {
  beforeAll(async () => {
    // Vider la collection et créer un utilisateur de test
    await User.deleteMany({});
    const user = new User({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('doit renvoyer un token quand les identifiants sont valides', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'user1', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    // Vérifier que le token est décodable et contient les informations de l'utilisateur
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('username', 'user1');
  });

  it('doit renvoyer 401 avec des identifiants invalides', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'user1', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: 'Nom d’utilisateur ou mot de passe incorrect' });
  });
  it('doit renvoyer 401 si aucun utilisateur n’est trouvé', async () => {
    // Aucune insertion, donc aucun utilisateur avec le nom "inexistant"
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'inexistant', password: 'nimportequoi' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: 'Nom d’utilisateur ou mot de passe incorrect' });
  });

  it('doit renvoyer 500 en cas d’erreur lors de la recherche de l’utilisateur (bloc catch)', async () => {
    // Forcer une erreur dans User.findOne
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Erreur simulée'));
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'user1', password: 'password123' });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: 'Erreur serveur' });
    User.findOne.mockRestore();
  });
});
