const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const navigationSchema = new mongoose.Schema(
  {
    navItem: {
      type: String
    },
    slug: {
      type: String
    },
    subLinks: [
      {
        title: String,
        content: [
          {
            path: String,
            title: String,
            image: {
              url: { type: String },
              type: {
                type: String,
                enum: ['image', 'video', 'gif'],
                default: 'image'
              }
            }

          }
        ],
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

navigationSchema.pre('save', function (next) {
  this.slug = slugify(this.navItem, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const Navigation = mongoose.model('Navigation', navigationSchema);

module.exports = Navigation;
