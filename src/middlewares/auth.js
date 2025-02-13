const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // L'en-tête doit avoir la forme "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Accès non autorisé : Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé : Format de token incorrect' });
  }
  try {
    // Vérification du token avec la clé secrète stockée dans l'environnement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Accès non autorisé : Token invalide' });
  }
};
