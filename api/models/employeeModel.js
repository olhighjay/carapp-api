const mongoose = require('mongoose');

const {Schema} = mongoose;

const employeeModel = new Schema(
  {
    _id:  mongoose.Schema.Types.ObjectId,
    firstName:  {
      type: String,
      required: true
    },
    lastName:  {
      type: String,
    },
    email:  {
      type: String,
      required: true,
      unique: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    phone_number:  {
      type: Number,
      required: false,
      unique: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password:  {
      type: String,
      required: true,
      minlength:6,
      default: 'password'
    },
    role: {
      type: String,
      required: true,
      enum : ['superadmin','admin','employee', 'driver'],
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

module.exports = mongoose.model('Employee', employeeModel);