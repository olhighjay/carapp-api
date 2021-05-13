const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { query } = require('express-validator');


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
    
  };


  async function signIn(req, res, next){
    
    try{
      //check for email uniqueness
      const employee = await Employee.findOne({ email: req.body.email});
      if(!employee){
        return res.status(401).json({
          message: 'Auth Failed on email'
        });
      }
      
      const verified = await bcrypt.compare(req.body.password, employee.password)
      console.log(chalk.blue(verified));
      if(!verified){
        return res.status(401).json({
          message: 'Auth Failed on password'
        });
      }
      const token = jwt.sign({
        role: employee.role,
        category: employee.category,
        userId: employee._id
        }, process.env.JWT_KEY,
        {
          expiresIn: "100h"
        }
      );
      return res.status(200).json({
        message: 'Auth Successful',
        token:token,
        Employee: employee
      });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
  };

  return {
    registerEmployee,
    signIn
  };
}



module.exports = employeesController;
