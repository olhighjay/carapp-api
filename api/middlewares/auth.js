const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next){
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    console.log(req.userData);
    next();
  }
  catch(error){
    return res.status(401).json({
      message: 'Auth failed. You can\'t access this page except you login'
    });
  }
}

module.exports = authMiddleware;
