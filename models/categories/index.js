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
    image: {
      type: String
    },
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sectors'
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
