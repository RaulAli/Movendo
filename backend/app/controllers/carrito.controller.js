const Carrito = require('../models/carrito.model');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET /api/carrito
// @desc    Get user's cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const userId = req.userId; // From verifyJWT middleware
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        let cart = await Carrito.findOne({ id_user: userId }).populate('items.id_evento');

        if (!cart) {
            // If no cart exists, create an empty one
            cart = new Carrito({ id_user: userId, items: [] });
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};

// @route   POST /api/carrito
// @desc    Add item to cart or update quantity if item exists
// @access  Private
exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { id_evento, cantidad, merchants } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!id_evento || !cantidad || cantidad < 1 || !merchants || !Array.isArray(merchants)) {
            return res.status(400).json({ message: 'Invalid item data provided.' });
        }
        for (const newProduct of merchants) { // Renamed newMerchant to newProduct
            if (!newProduct.id_product || !newProduct.cantidad || newProduct.cantidad < 1) {
                return res.status(400).json({ message: 'Invalid product data provided for an item.' }); // Updated message
            }
        }

        let cart = await Carrito.findOne({ id_user: userId });

        if (!cart) {
            cart = new Carrito({ id_user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.id_evento.toString() === id_evento);

        if (itemIndex > -1) {
            // Item exists, update quantity and merge products
            cart.items[itemIndex].cantidad += cantidad;

            // Merge products: for each new product, if it exists, update quantity, else add new
            merchants.forEach(newProduct => {
                const existingProductIndex = cart.items[itemIndex].merchants.findIndex(
                    m => m.id_product.toString() === newProduct.id_product
                );
                if (existingProductIndex > -1) {
                    cart.items[itemIndex].merchants[existingProductIndex].cantidad += newProduct.cantidad;
                } else {
                    cart.items[itemIndex].merchants.push({ id_product: newProduct.id_product, cantidad: newProduct.cantidad });
                }
            });

        } else {
            // Item does not exist, add new item
            cart.items.push({ id_evento, cantidad, merchants }); // merchants now contains id_product
        }

        const updatedCart = await cart.save();
        await updatedCart.populate('items.id_evento');
        res.status(200).json(updatedCart);

    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

// @route   PUT /api/carrito/:eventoId/product/:productId
// @desc    Update quantity of a specific merchant product in cart
// @access  Private
exports.updateCartMerchantItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventoId, productId } = req.params;
        const { cantidad } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!eventoId || !productId || cantidad === undefined || cantidad < 0) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        let cart = await Carrito.findOne({ id_user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.id_evento.toString() === eventoId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Event item not found in cart.' });
        }

        const merchantProductIndex = cart.items[itemIndex].merchants.findIndex(
            m => m.id_product.toString() === productId
        );

        if (merchantProductIndex === -1) {
            return res.status(404).json({ message: 'Merchant product not found in cart item.' });
        }

        if (cantidad === 0) {
            // Remove the product if quantity is 0
            cart.items[itemIndex].merchants.splice(merchantProductIndex, 1);
        } else {
            cart.items[itemIndex].merchants[merchantProductIndex].cantidad = cantidad;
        }

        const updatedCart = await cart.save();
        await updatedCart.populate('items.id_evento');
        res.status(200).json(updatedCart);

    } catch (error) {
        console.error('Error updating merchant product quantity in cart:', error);
        res.status(500).json({ message: 'Error updating merchant product quantity in cart', error: error.message });
    }
};

// @route   DELETE /api/carrito/:eventoId/product/:productId
// @desc    Remove a specific merchant product from cart
// @access  Private
exports.removeMerchantProductFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventoId, productId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!eventoId || !productId) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        let cart = await Carrito.findOne({ id_user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.id_evento.toString() === eventoId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Event item not found in cart.' });
        }

        const initialMerchantProductsLength = cart.items[itemIndex].merchants.length;
        cart.items[itemIndex].merchants = cart.items[itemIndex].merchants.filter(
            m => m.id_product.toString() !== productId
        );

        if (cart.items[itemIndex].merchants.length < initialMerchantProductsLength) {
            const updatedCart = await cart.save();
            await updatedCart.populate('items.id_evento');
            res.status(200).json(updatedCart);
        } else {
            return res.status(404).json({ message: 'Merchant product not found in cart item.' });
        }

    } catch (error) {
        console.error('Error removing merchant product from cart:', error);
        res.status(500).json({ message: 'Error removing merchant product from cart', error: error.message });
    }
};

// @route   PUT /api/carrito/:eventoId
// @desc    Update item quantity in cart
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventoId } = req.params;
        const { cantidad } = req.body; // New total quantity for the item

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!eventoId || !cantidad || cantidad < 0) { // cantidad can be 0 to remove
            return res.status(400).json({ message: 'Invalid item ID or quantity provided.' });
        }

        let cart = await Carrito.findOne({ id_user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const itemIndex = cart.items.findIndex(item => item.id_evento.toString() === eventoId);

        if (itemIndex > -1) {
            if (cantidad === 0) {
                // Remove item if quantity is 0
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].cantidad = cantidad;
            }
            const updatedCart = await cart.save();
            await updatedCart.populate('items.id_evento');
            res.status(200).json(updatedCart);
        } else {
            res.status(404).json({ message: 'Item not found in cart.' });
        }

    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
};

// @route   DELETE /api/carrito/:eventoId
// @desc    Remove item from cart
// @access  Private
exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventoId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!eventoId) {
            return res.status(400).json({ message: 'Invalid item ID provided.' });
        }

        let cart = await Carrito.findOne({ id_user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.id_evento.toString() !== eventoId);

        if (cart.items.length < initialLength) {
            const updatedCart = await cart.save();
            await updatedCart.populate('items.id_evento');
            res.status(200).json(updatedCart);
        } else {
            res.status(404).json({ message: 'Item not found in cart.' });
        }

    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};