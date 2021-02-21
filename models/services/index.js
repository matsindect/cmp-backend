const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify')

const serviceSchema = new mongoose.Schema(
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
    sectors:[{
      type: types.ObjectId,
      ref: 'Sector' 
    }],
    business_types:[{
      type: types.ObjectId,
      ref: 'BusinessType' 
    }],
    parent:[
      {
        type: types.ObjectId,
      ref: 'Service'
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

serviceSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
