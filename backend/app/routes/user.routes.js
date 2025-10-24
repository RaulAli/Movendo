// routes/user.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const verifyJWT = require('../middlewares/verifyJWT')
// Registration
router.post('/users', controller.registerUser);

// Login
router.post('/users/login', controller.userLogin);

// Get Current User (protegida)
router.get('/user', verifyJWT, controller.getCurrentUser);

// Update User (protegida)
router.put('/user', verifyJWT, controller.updateUser);

// Refresh Token
router.get('/refresh', controller.handleRefreshToken);

// Logout
router.get('/logout', controller.logout);

module.exports = router;
