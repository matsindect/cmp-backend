const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

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
    type: {
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

    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
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
    variants: [
      {
        label: {
          type: String
        }
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
attributesSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const Attributes = mongoose.model('Attributes', attributesSchema);

module.exports = Attributes;
