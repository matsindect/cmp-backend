const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const productCategorySchema = new mongoose.Schema(
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
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
      }
    ],
    parent: [
      {
        type: types.ObjectId,
        ref: 'ProductCategory'
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

productCategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const ProductCategory = mongoose.model(
  'ProductCategory',
  productCategorySchema
);

module.exports = ProductCategory;
