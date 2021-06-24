const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const serviceCategorySchema = new mongoose.Schema(
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
    child_category: [
      {
        type: types.ObjectId,
        ref: 'ServiceCategory'
      }
    ],
    business_types: [
      {
        type: types.ObjectId,
        ref: 'BusinessType'
      }
    ],
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
    parent: [
      {
        type: types.ObjectId,
        ref: 'ServiceCategory'
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

serviceCategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const ServiceCategory = mongoose.model(
  'ServiceCategory',
  serviceCategorySchema
);

module.exports = ServiceCategory;
