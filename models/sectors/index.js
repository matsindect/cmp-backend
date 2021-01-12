const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const sectorSchema = new mongoose.Schema(
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
    image: {
      type: String
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

sectorSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  next();
});

const Sector = mongoose.model('Sector', sectorSchema);

module.exports = Sector;
