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
    product_id: {
      type: types.ObjectId,
      ref: 'ProductCategory'
    },
    post_name: {
      type: String
    },
    slug: {
      type: String
    },
    featuredImageId: {
      type: String
    },
    post_tattributes: [
      {
        value: {
          type: types.ObjectId,
          ref: 'Attributes'
        },
        label: {
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
    services: [
      {
        type: types.ObjectId,
        ref: 'Service'
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
