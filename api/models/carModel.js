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
      type: String
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
  }, {timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Car', carModel);