const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

const Order = require('../models/Order');
const Product = require('../models/Product');

const CurrencyService = require('../services/CurrencyService');

// @route     GET /orders
// @desc      Get orders to check
// @access    User
// @params
router.get('/', auth, (req, res) => {
  Order.find({}).then(orders => {
    res.json(orders);
  });
});

// @route     POST /orders/
// @desc      Add products to last order
// @access    User
// @params    productId, customizationText, customizationColor, quantity
router.post('/', auth, async (req, res) => {
  const {
    productId,
    customizationText,
    customizationColor,
    quantity,
  } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Please enter product id' });
  }

  if (customizationText && !customizationColor) {
    return res.status(400).json({ message: 'Missing color' });
  }

  const product = await Product.findOne({ _id: productId }).exec();
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Get latest order that is status 'Active'
  const orders = await Order.find({
    userId: req.user.id,
    status: 'Active',
  }).sort({ createdAt: 'desc' });

  let latestOrder;

  // Handle first ever order
  if (orders.length === 0) {
    // Handle first ever order
    latestOrder = await Order.create({ userId: req.user.id });
    // if (latestOrder.error) res.status(500).json({ latestOrder.error })
    latestOrder.products = [];
  } else if (orders.length > 1) {
    // Handle more than one active order
    latestOrder = orders[0];
    orders.shift();
    // Deactivate other orders
    orders.forEach(order => {
      order.status = 'Inactive';
      order.save();
    });
  } else {
    // Handle 1 current order
    latestOrder = orders[0];
  }

  // Add price to productPrice and customizationPrice
  const productPrice = product.price;
  let customizationPrice = 0;

  // Check if black or white color has cost
  if (customizationColor === 'black' || customizationColor === 'white') {
    const colorCustomization = await Product.findOne({
      type: 'text customization',
      color: customizationColor,
    });
    customizationPrice = colorCustomization.price;
  } else if (customizationColor) {
    const colorCustomization = await Product.findOne({
      type: 'text customization',
      color: 'color',
    });
    customizationPrice = colorCustomization.price;
  }

  latestOrder.products.push({
    productId,
    productPrice,
    customizationText,
    customizationColor,
    customizationPrice,
    quantity,
  });

  // Calculate new cost
  let totalCost = 0;
  latestOrder.products.forEach(product => {
    totalCost += (product.productPrice + customizationPrice) * quantity;
  });

  latestOrder.total = totalCost.toFixed(2);
  await latestOrder.save().then((order, err) => {
    if (err) res.status(500).send({ err });
  });
  const localOrder = await CurrencyService.getExchangedOrder(
    req.user.currency,
    latestOrder
  );
  console.log(localOrder);
  return res.json(localOrder);
});

// @route     PUT /orders/
// @desc      Edit order in inventory, remove items from order in inventory
// @access    User
// @params    type, index, quantity, checkoutMethod
// Sample Payload
router.put('/', auth, async (req, res) => {
  const { type, index, quantity, checkoutMethod } = req.body;

  // Check for valid data
  if (
    (type === 'CHECKOUT' && !checkoutMethod) ||
    (type === 'UPDATE_QUANTITY' && (index === null || quantity < 1)) ||
    (type === 'REMOVE_PRODUCT' && index === null)
  ) {
    return res.status(400).json({ message: 'Error in data' });
  }

  // Get users latest active orders
  const orders = await Order.find({
    userId: req.user.id,
    status: 'Active',
  }).sort({ createdAt: 'desc' });

  // If orders === 0, create new blank order for user, exit out with error
  if (orders.length === 0) {
    await Order.create({ userId: req.user.id });
    res.error({ msg: 'No valid order to modify, please try again' });
  }

  // If orders > 1, deactivate older orders, exit out with error (to avoid possible issue)
  if (orders.length > 1) {
    orders.shift();
    orders.forEach(order => {
      order.status = 'Inactive';
      order.save();
    });
    res.error({ msg: 'Please try again' });
  }

  // If orders === 1, update products
  const latestOrder = orders[0];

  // Handle Checking Out
  if (type === 'CHECKOUT') {
    if (latestOrder.products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }
    latestOrder.status = 'Ordered';
    await Order.create({ userId: req.user.id }).then(err => {
      if (err) res.status(500).send({ err });
    });
    latestOrder.markModified('products');
    await latestOrder.save().then(err => {
      if (err) res.status(500).send({ err });
    });
    const localOrder = await CurrencyService.getExchangedOrder(
      req.user.currency,
      latestOrder
    );
    return res.json(localOrder);
  }

  // Handle Updating Quantity or Removing Product
  if (!(index >= 0 && index < latestOrder.products.length)) {
    return res.status(400).json({ message: 'Index out range error' });
  }
  if (type === 'UPDATE_QUANTITY') {
    latestOrder.products[index].quantity = quantity;
    latestOrder.markModified('products');
    await latestOrder.save().then(err => {
      if (err) res.status(500).send({ err });
    });
    const localOrder = await CurrencyService.getExchangedOrder(
      req.user.currency,
      latestOrder
    );
    return res.json(localOrder);
  }
  if (type === 'REMOVE_PRODUCT') {
    latestOrder.products.splice(index, 1);
    latestOrder.markModified('products');
    await latestOrder.save().then(err => {
      if (err) res.status(500).send({ err });
    });
    const localOrder = await CurrencyService.getExchangedOrder(
      req.user.currency,
      latestOrder
    );
    return res.json(localOrder);
  }
});

module.exports = router;
