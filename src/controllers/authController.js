const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log("Requête de connexion reçue :", { username, password });
  try {
    // Recherche de l'utilisateur dans la BDD
    const user = await User.findOne({ username });
    console.log("Utilisateur trouvé dans la BDD :", user);
    if (!user) {
      console.log("Aucun utilisateur trouvé pour le nom d'utilisateur :", username);
      return res.status(401).json({ error: 'Nom d’utilisateur ou mot de passe incorrect' });
    }
    // Comparaison du mot de passe fourni avec le mot de passe haché stocké
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Résultat de la comparaison de mot de passe :", isMatch);
    if (!isMatch) {
      console.log("Le mot de passe fourni est incorrect pour l'utilisateur :", username);
      return res.status(401).json({ error: 'Nom d’utilisateur ou mot de passe incorrect' });
    }
    // Génération du token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("Token généré :", token);
    return res.json({ token });
  } catch (err) {
    console.error("Erreur lors du login :", err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
