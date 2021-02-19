const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const attributesSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    unit: {
      type: String
    },
    description: {
      type: String
    },
    slug: {
      type: String
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    images: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ['image', 'gif'],
          default: 'image'
        }
      }
    ],
    featuredImageId: {
      type: types.ObjectId,
      ref: 'Service'
    },
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
      }
    ],
    varriants:[{
      label:{
        type: String
      }
    }],
    parent_attributes: [
      {
        type: types.ObjectId,
        ref: 'Attributes'
      }
    ],
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

const Attributes = mongoose.model('Attributes', attributesSchema);

module.exports = Attributes;
