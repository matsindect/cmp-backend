const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const BusinessTypeSchema = new mongoose.Schema(
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
      ref: 'BusinessType'
    },
    service_category: [
      {
        value: {
          type: types.ObjectId,
          ref: 'ServiceSategory'
        },
        label: {
          type: String
        }
      }
    ],
    product_category: [
      {
        value: {
          type: types.ObjectId,
          ref: 'ProductSategory'
        },
        label: {
          type: String
        }
      }
    ],
    parent: [
      {
        value: {
          type: types.ObjectId,
          ref: 'BusinessType'
        },
        label: {
          type: String
        }
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

BusinessTypeSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const BusinessType = mongoose.model('BusinessType', BusinessTypeSchema);

module.exports = BusinessType;
