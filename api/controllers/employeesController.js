const chalk = require('chalk');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


function employeesController(Employee) {

  async function registerEmployee(req, res, next){
    try{
      //check for email uniqueness
      const availableUser = await Employee.find({ email: req.body.email });
      if(availableUser.length > 0){
        return res.status(409).json({
          message: 'Email already taken by another user'
        });
      }

      // if(!req.body.password){
      //   return res.status(409).json({
      //     message: 'Password is required'
      //   });
      // }

      const hashedPassword = await bcrypt.hash('password', 13);
    
      const employee = new Employee({
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        password: hashedPassword,
        category: req.body.category,
      });
      await employee.save();
      res.status(201).json({
        message: 'Employee was created successfully',
        createdEmployee: {
          employee: employee
        }
      });
    }
    catch(err) {
      res.status(500).json({
        error: err.message
      });
    };    
    
  }

  return {
    // get,
    registerEmployee,
    // signIn,
    // updateUser,
    // getUserById,
    // deleteUser
  };
}

module.exports = employeesController;
