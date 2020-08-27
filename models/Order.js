const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId, Mixed } = mongoose.Schema.Types;

const OrderSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    products: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
      default: 'Active',
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('order', OrderSchema);
module.exports = Order;
