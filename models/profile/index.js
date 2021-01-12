const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: types.ObjectId,
      ref: 'User'
    },
    company: {
      name: {
        type: String
      },
      number: {
        code: {
          type: String
        },
        number: {
          type: String
        }
      },
      location: {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      about: {
        type: String
      },
      address: {
        type: String
      },
      tel: {
        code: {
          type: String
        },
        number: {
          type: String
        }
      },
      fax: {
        code: {
          type: String
        },
        number: {
          type: String
        }
      },
      website: {
        type: String
      },
      email: {
        type: String
      },
      businesstype: {
        type: types.ObjectId,
        ref: 'BusinessType'
      },
      logo: {
        type: String
      },
      license: {
        type: String
      }
    },
    products_catalogue: [String],
    gallery: [String],
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
        ref: 'Category'
      }
    ],
    sectors: [
      {
        type: types.ObjectId,
        ref: 'Sectors'
      }
    ],
    services: [
      {
        type: types.ObjectId,
        ref: 'Services'
      }
    ],
    sub_services: [
      {
        type: types.ObjectId,
        ref: 'Subservices'
      }
    ],
    products: [
      {
        type: types.ObjectId,
        ref: 'Products'
      }
    ],
    city: [
      {
        type: types.ObjectId,
        ref: 'City'
      }
    ],
    country: [
      {
        type: types.ObjectId,
        ref: 'Country'
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

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
