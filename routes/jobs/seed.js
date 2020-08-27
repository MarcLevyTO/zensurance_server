const express = require('express');
const fs = require('fs');
const JSONStream = require('JSONStream');

const router = express.Router();

const path = require('path');
const Product = require('../../models/Product');

// @route     GET /jobs/seedDb
// @desc
// @access
// @params
router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', '..', 'tempData', 'options.json');
  const stream = fs.createReadStream(filePath, {
    encoding: 'utf8',
  });
  const parser = JSONStream.parse();
  stream.pipe(parser);
  return new Promise((resolve, reject) => {
    parser.on('data', function(obj) {
      const newProduct = new Product({
        type: obj.type,
        material: obj.material,
        color: obj.color,
        price: obj.price,
      });
      newProduct.save();
    });
    parser.on('error', reject);
    parser.on('end', () => resolve(res.json({ success: true })));
  });
});

module.exports = router;
