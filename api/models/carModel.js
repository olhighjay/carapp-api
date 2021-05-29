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
    display_picture: {type: String}
  }, {timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Car', carModel);