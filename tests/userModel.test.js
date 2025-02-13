const mongoose = require('mongoose');
const User = require('../src/models/user');
const bcrypt = require('bcrypt');

if (!process.env.JWT_SECRET) {
    require('dotenv').config({ path: '.env.test' });
  }


describe('Modèle User', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('doit hacher le mot de passe lors de la création', async () => {
    const motDePasseClair = 'password123';
    const user = new User({ username: 'testuser', email: 'test@example.com', password: motDePasseClair });
    await user.save();
    expect(user.password).not.toEqual(motDePasseClair);
    const correspondance = await bcrypt.compare(motDePasseClair, user.password);
    expect(correspondance).toBe(true);
  });

  it('ne doit pas re-hacher le mot de passe si celui-ci n\'est pas modifié', async () => {
    const motDePasseClair = 'password123';
    const user = new User({ username: 'testuser2', email: 'test2@example.com', password: motDePasseClair });
    await user.save();
    const hashInitial = user.password;
    user.username = 'nouveauNom';
    await user.save();
    expect(user.password).toEqual(hashInitial);
  });
});
