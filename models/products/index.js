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
      currency: {
        type: String
      },
      price: {
        type: String
      }
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
        value: [
          {
            type: String
          }
        ],
        unit: {
          type: String
        }
      }
    ],
    description: {
      type: String
    },
    products_catalogue: [String],
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
        ref: 'Category'
      }
    ],
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sectors'
      }
    ],
    origin: {
      city: {
        type: types.ObjectId,
        ref: 'City'
      },
      country: {
        type: types.ObjectId,
        ref: 'Country'
      }
    },
    reviews: [
      {
        type: types.ObjectId,
        ref: 'Reviews'
      }
    ],
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

productSchema.pre('save', function(next) {
  this.slug = slugify(this.product_name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
