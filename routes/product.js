const express = require('express');
const { Op, Sequelize } = require('sequelize');
const { Product, CartItem, OrderItem } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      products: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  const transaction = await Product.sequelize.transaction();
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get all products including the one to delete, sorted by id
    const allProducts = await Product.findAll({
      order: [['id', 'ASC']],
      transaction
    });

    // Update CartItems and OrderItems with new productId before deletion
    for (let i = 0; i < allProducts.length; i++) {
      const currentId = allProducts[i].id;
      const newId = i + 1;
      if (currentId === productId) continue; // Skip the product being deleted
      if (currentId !== newId) {
        await CartItem.update(
          { productId: newId },
          { where: { productId: currentId }, transaction }
        ).catch(err => { throw new Error(`CartItem update failed: ${err.message}`); });
        await OrderItem.update(
          { productId: newId },
          { where: { productId: currentId }, transaction }
        ).catch(err => { throw new Error(`OrderItem update failed: ${err.message}`); });
        await Product.update(
          { id: newId },
          { where: { id: currentId }, transaction }
        ).catch(err => { throw new Error(`Product update failed: ${err.message}`); });
      }
    }

    // Delete the product after updating references
    await product.destroy({ transaction });

    // Update the SQLite sequence based on remaining products
    const remainingCount = allProducts.length - 1; // Exclude the deleted product
    const maxId = remainingCount > 0 ? remainingCount : 0;
    await Product.sequelize.query(
      `UPDATE sqlite_sequence SET seq = ${maxId} WHERE name = 'Products';`,
      { transaction }
    );

    await transaction.commit();
    res.json({ message: 'Product deleted and IDs resequenced' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete product error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;