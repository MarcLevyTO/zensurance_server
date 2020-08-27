const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Mixed } = mongoose.Schema.Types;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Active',
    },
    type: {
      type: String,
      required: true,
      default: 'Basic',
    },
    currency: {
      type: String,
      required: true,
      default: 'CAD',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('user', UserSchema);
module.exports = User;
