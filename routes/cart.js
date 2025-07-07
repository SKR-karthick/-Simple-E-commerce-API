const express = require('express');
const { Cart, CartItem, Product } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth(['customer']), async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id }, include: [{ model: CartItem, include: [Product] }] });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/add', auth(['customer']), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid productId' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    const updatedCart = await Cart.findOne({ 
      where: { userId: req.user.id }, 
      include: [{ model: CartItem, include: [Product] }]
    });
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/update', auth(['customer']), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid productId' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ message: 'Item not found' });
    await cartItem.update({ quantity });
    const updatedCart = await Cart.findOne({ 
      where: { userId: req.user.id }, 
      include: [{ model: CartItem, include: [Product] }]
    });
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/remove/:productId', auth(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    await CartItem.destroy({ where: { cartId: cart.id, productId: req.params.productId } });
    const updatedCart = await Cart.findOne({ 
      where: { userId: req.user.id }, 
      include: [{ model: CartItem, include: [Product] }]
    });
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;