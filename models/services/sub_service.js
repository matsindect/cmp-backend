const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = Schema.Types;

const subServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    description: {
      type: String
    },
    parent: [
      {
        value:{
          type:types.ObjectId,
          ref:'Service'
        },
        label:{
          type:String
        }
      }
    ],
    sectors:[
      {
      value:{
        type:types.ObjectId,
        ref:'Sector'
      },
      label:{
        type:String
      }
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

const SubService = mongoose.model('SubService', subServiceSchema);

module.exports = SubService;
