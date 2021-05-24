const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: types.ObjectId,
      ref: 'User'
    },
    product: {
      type: types.ObjectId,
      ref: 'ProductCategory'
    },
    post_name: {
      type: String
    },
    slug: {
      type: String
    },
    post_tattributes: [
      {
        key: {
          type: types.ObjectId,
          ref: 'Attributes'
        },
        value: {
          type: String
        }
      }
    ],
    description: {
      type: String
    },
    images: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ['image', 'video', 'gif'],
          default: 'image'
        }
      }
    ],
    product_categories: [
      {
        type: types.ObjectId,
        ref: 'ProductCategory'
      }
    ],
    business_types: [
      {
        type: types.ObjectId,
        ref: 'BusinessType'
      }
    ],
    tags: [
      {
        type: types.ObjectId,
        ref: 'Tags'
      }
    ],
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
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

postSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
