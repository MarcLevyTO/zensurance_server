const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const Product = require('../models/Product');
const CurrencyService = require('../services/CurrencyService');

// @route     GET /products
// @desc      Get products to check
// @access    User
// @params
router.get('/', auth, async (req, res) => {
  const currencyRate = await CurrencyService.getRate(req.user.currency);
  const products = await Product.find({ status: 'Active' });
  res.json(
    products.map(product => {
      const newProduct = JSON.parse(JSON.stringify(product));
      newProduct.localPrice = (product.price * currencyRate).toFixed(2);
      return newProduct;
    })
  );
});

// FOR THE PURPOSES OF THIS TAKE HOME CHALLENGE, THE FOLLOWING ROUTES ARE NOT IMPLEMENTED

// @route     POST /products
// @desc      Add a product to inventory
// @access    admin
// @params    shirt_type, material, color, price
// router.post('/', adminAuth, (req, res) => {...})

// @route     GET /products/:id
// @desc      Get product to check
// @access
// @params
// router.get('/:id', (req, res) => {...})

// @route     PUT /products/:id
// @desc      Edit product in inventory
// @access    admin
// @params    shirt_type, material, color, price
// router.put('/', adminAuth, (req, res) => {...})

// @route     DELETE /products/:id
// @desc      Archive product
// @access    admin
// @params
// router.delete('/:id', adminAuth, (req, res) => {...})

module.exports = router;
