const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;
const slugify = require('slugify');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: types.ObjectId,
      ref: 'User'
    },
    slug: {
      type: String
    },
    company: {
      name: {
        type: String
      },
      location: {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          default: [51.5287714, -0.2420248],
          index: '2dsphere'
        },
        address: String,
        state: {
          type: String
        },
        city: {
          type: String
        },
        area: {
          type: String
        },
        country: {
          type: String
        }
      },
      about: {
        type: String
      },
      tel: {
        type: String
      },
      fax: {
        type: String
      },
      website: {
        type: String
      },
      email: {
        type: String
      }
    },
    logo: {
      type: String
    },
    license: {
      type: String
    },
    products_catalogue: [String],
    images: [String],
    featuredImageId: {
      type: String
    },
    contact_person: [
      {
        name: {
          type: String
        },
        cellphone: {
          type: String
        },
        email: {
          type: String
        },
        disignation: {
          type: String
        }
      }
    ],
    categories: [
      {
        type: types.ObjectId,
        ref: 'ProductCategory'
      }
    ],
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sector'
      }
    ],
    services: [
      {
        type: types.ObjectId,
        ref: 'Service'
      }
    ],
    products: [
      {
        type: types.ObjectId,
        ref: 'Products'
      }
    ],
    social: {
      youtube: {
        type: String
      },
      twitter: {
        type: String
      },
      facebook: {
        type: String
      },
      lnkedin: {
        type: String
      },
      instagram: {
        type: String
      }
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

profileSchema.pre('save', function(next) {
  this.slug = slugify(this.company.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});
profileSchema.virtual('business_types', {
  ref: 'User',
  foreignField: '_id',
  localField: 'user'
});
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
