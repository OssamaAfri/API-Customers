const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route de login pour générer le JWT
router.post('/login', authController.login);

module.exports = router;
