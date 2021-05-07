const mongoose = require('mongoose');

const {Schema} = mongoose;

const roleModel = new Schema(
  {
    _id:  mongoose.Schema.Types.ObjectId,
    name:  {
      type: String,
      required: true
    },
    description:  {
      type: String
    },
  }
);

module.exports = mongoose.model('Role', roleModel);