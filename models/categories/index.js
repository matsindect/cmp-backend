const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
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
    image: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ['images', 'gif'],
          default: 'image'
        }
      }
    ],
    parent_categories: [
      {
        type: types.ObjectId,
        ref: 'Category'
      }
    ],
    order: {
      type: Number,
      required: true,
      min: 0
    },
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

categorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
