const { check, validationResult } = require("express-validator");

function validationError(req, res, next){
  const error = validationResult(req).formatWith(({ msg }) => msg);

  if (!error.isEmpty()){
    return res.status(422).json({ error: error.array() });
  }
  next();
}


module.exports = validationError;