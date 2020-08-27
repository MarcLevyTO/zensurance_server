const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Mixed } = mongoose.Schema.Types;

const ProductSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('product', ProductSchema);
module.exports = Product;
