require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const User = require('../src/models/user'); 

const username = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!username || !email || !password) {
  console.log("Usage: node scripts/createUser.js <username> <email> <password>");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connecté à la base de données");

    // Créer un nouvel utilisateur. et hachage du mot de passe.
    const newUser = new User({ username, email, password });
    await newUser.save();
    console.log("Utilisateur créé avec succès:", newUser);
    process.exit(0);
  })
  .catch(err => {
    console.error("Erreur lors de la connexion à la base de données:", err);
    process.exit(1);
  });
