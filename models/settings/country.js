const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const CountrySchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    slug: {
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
    featuredImageId: {
      type: types.ObjectId,
      ref: 'Country'
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

CountrySchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
