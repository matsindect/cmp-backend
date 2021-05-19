const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const productSchema = new mongoose.Schema(
  {
    user: {
      type: types.ObjectId,
      ref: 'User'
    },
    product_name: {
      type: String
    },
    quantity: {
      type: Number
    },
    slug: {
      type: String
    },
    product_pricing: {
      type: String
    },
    product_location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    product_attributes: [
      {
        key: {
          type: String
        },
        unit: {
          //selected by the user
          type: String
        },
        value: {
          // selected by the user
          type: String
        }
      }
    ],
    description: {
      type: String
    },
    products_catalogue: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ['image', 'video', 'gif'],
          default: 'image'
        }
      }
    ],
    images: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ['image', 'video', 'gif'],
          default: 'image'
        }
      }
    ],
    product_categories: [
      {
        type: types.ObjectId,
        ref: 'ProductCategory'
      }
    ],
    business_types: [
      {
        type: types.ObjectId,
        ref: 'BusinessType'
      }
    ],
    tags: [
      {
        type: types.ObjectId,
        ref: 'Tags'
      }
    ],
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
      }
    ],
    origin: {
      type: String
    },
    reviews: [
      {
        type: types.ObjectId,
        ref: 'Reviews'
      }
    ],
    active: {
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
