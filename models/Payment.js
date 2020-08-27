const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId, Mixed } = mongoose.Schema.Types;

const PaymentSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    orderId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('payment', PaymentSchema);
module.exports = Payment;
