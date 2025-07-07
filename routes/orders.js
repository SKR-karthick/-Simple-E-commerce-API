const express = require('express');
const { Order, OrderItem, Cart, CartItem, Product } = require('../models'); // Use index.js
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id }, include: [{ model: CartItem, include: [Product] }] });
    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    for (const item of cart.CartItems) {
      total += item.Product.price * item.quantity;
    }

    const order = await Order.create({ userId: req.user.id, total });
    const orderItems = cart.CartItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity
    }));
    await OrderItem.bulkCreate(orderItems);
    await CartItem.destroy({ where: { cartId: cart.id } });

    const createdOrder = await Order.findOne({ where: { id: order.id }, include: [{ model: OrderItem, include: [Product] }] });
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth(['customer']), async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, include: [Product] }] });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;