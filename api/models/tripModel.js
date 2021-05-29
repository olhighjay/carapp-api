const mongoose = require('mongoose');

const {Schema} = mongoose;

const tripModel = new Schema(
  {
    _id:  mongoose.Schema.Types.ObjectId,
    state:  {
      type: String,
      required: true
    },
    address:  {
      type: String,
      required: true
    },
    summary:  {
      type: String
    },
    accident:  {
      type: Boolean,
      default: false
    },
    fault:  {
      type: Boolean,
      default: false
    },
    fault_summary:  {
      type: String
    },
    emergency:  {
      type: Boolean,
      default: false
    },
    confirmed:  {
      type: Boolean,
      default: true
    },
    start_time: {
      type: Date,
      required: true
    },
    end_time: {
      type: Date,
      required: true
    },
    started_time: {
      type: Date
    },
    ended_time: {
      type: Date
    },
    start_time_grace: {
      type: Date
    },
    end_time_grace: {
      type: Date
    },
    extra_time_grace: {
      type: Date
    },
    status: {
      type: String,
      enum : ['pending','booked','ongoing','completed'],
      default: 'booked'
    },
    car:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Car'
    },
    employee:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Employee'
    },
    driver:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Employee'
    },
    creator:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Employee'
    },
  }, {timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Trip', tripModel);