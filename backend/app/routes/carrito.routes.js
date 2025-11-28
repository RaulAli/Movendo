const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');
const verifyJWT = require('../middlewares/verifyJWT');

// Get user's cart
router.get('/carrito', verifyJWT, carritoController.getCart);

// Add item to cart or update quantity if item exists
router.post('/carrito', verifyJWT, carritoController.addItemToCart);

// Update item quantity in cart
router.put('/carrito/:eventoId', verifyJWT, carritoController.updateCartItem);

// Remove item from cart
router.delete('/carrito/:eventoId', verifyJWT, carritoController.removeItemFromCart);

module.exports = router;
