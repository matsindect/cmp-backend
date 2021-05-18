const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const attributesSchema = new mongoose.Schema(
  {
    name: {
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
          type:types.ObjectId,
          ref:'Sector'
      }
    ],
    business_type: [
      {
        type: types.ObjectId,
        ref: 'BusinessType'
      }
    ],
    product_category: [
      {
        type: types.ObjectId,
        ref: 'ProductCategory'
      }
    ],
    service: [
      {
        type: types.ObjectId,
        ref: 'Service'
      }
    ],
    variants:[ {
        type: String
      }],
    
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
