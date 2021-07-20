const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const usertypeSchema = new mongoose.Schema(
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

usertypeSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const usertype = mongoose.model('usertype', usertypeSchema);

module.exports = usertype;
