const chalk = require('chalk');
const mongoose = require('mongoose');
// const debug = require('debug')('app:postsController');

function rolesController(Role) {

  async function post(req, res, next){
      try{
        const role = new Role({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          description: req.body.description
        });
        console.log(role);
        await role.save();
        console.log(role);
        res.status(201).json({
          message: 'Role was created successfully',
          createdRole: {
            role: role
          }
        });
      }
      catch(err) {
        console.log(err);
        res.status(500).json({
          error: err.stack
        });
      };
    
    
  }



  return {
    post
  };
}

module.exports = rolesController;