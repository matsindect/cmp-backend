const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    description: {
      type: String
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    is_active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
