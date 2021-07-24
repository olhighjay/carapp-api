const mongoose = require('mongoose');

const {Schema} = mongoose;

const carModel = new Schema(
  {
    _id:  mongoose.Schema.Types.ObjectId,
    plate_number:  {
      type: String,
      required: true,
      unique: true,
    },
    brand:  {
      type: String
    },
    model:  {
      type: String
    },
    color:  {
      type: String,
      required: true
    },
    properties:  {
      type: String
    },
    condition: {
      type: String,
      enum : ['excellent','fair','faulty'],
      default: 'excellent'
    },
    type: {
      type: String,
      enum : ['motorcycle','saloon','suv','lorry','bus','trailer'],
      default: 'saloon'
    },
    status: {
      type: String,
      enum : ['available','unavailable','booked'],
      default: 'available'
    },
    category: {
      type: String,
      enum : ['senior executive','executive','senior staff','staff'],
      default: 'staff',
      required: true,
    },
    display_picture: {type: String},
    deleted_at: {
      type: Date,
      default: null,
      required: false,
    },
  }, {timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Car', carModel);