const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { query } = require('express-validator');
const { json } = require('body-parser');


function profileController(Employee) {

  async   function viewProfile(req, res, next){
    
    try{
      if(!req.headers.authorization){
        // console.log('Login asshole');
        throw new Error('User needs to Login');
      }
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const userData = decoded;
      // console.log(userData);
      const employee = await Employee.findById(userData.userId);
      
      // console.log(employee);
      res.status(200).json({
        employee : {
        "id": employee._id,
        "firstName": employee.firstName,
        "lastName": employee.lastName,
        "email": employee.email,
        "phone_number": employee.phone_number,
        "display_picture": employee.display_picture,
        "createdAt": employee.createdAt,
        "updatedAt": employee.updatedAt,
        }
      });
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };


  async function updateProfile(req, res, next){
    const update = req.body;
    // const updateToArray = Object.keys(update)
    // console.log(update);

    try{
      if(!req.headers.authorization){
        // console.log('Login asshole');
        throw new Error('User needs to Login');
      }
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const userData = decoded;
      // console.log(userData);
      const employee = await Employee.findById(userData.userId);
      if(update.firstName){
        employee.firstName = update.firstName;
      };
      if(update.lastName){
        employee.lastName =  update.lastName;
      };
      if(update.email){
        employee.email =  update.email;
      };
      if(update.phone_number){
        employee.phone_number = update.phone_number;
      };
      console.log(employee);

      if(req.file){
        // delete the image from storage
        if(employee.display_picture){
          fs.unlink( employee.display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        employee.display_picture = req.file.path;
      }
      
      // if(update.password){
      //   const hashedPassword = await bcrypt.hash(req.body.password, 13);
      //   employee[0].password = hashedPassword;
      // }

      await employee.save();
      
      res.status(201).json({
        message: "Profile updated successfully",
        employee : {
          "category": employee.category,
          "_id": employee._id,
          "firstName": employee.firstName,
          "lastName": employee.lastName,
          "email": employee.email,
          "phone_number": employee.phone_number,
          "role": employee.role,
          "display_picture": employee.display_picture,
          "createdAt": employee.createdAt,
          "updatedAt": employee.updatedAt,
          }
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };

  
  async function updatePassword(req, res, next){

    try{
      if(!req.headers.authorization){
        // console.log('Login asshole');
        throw new Error('User needs to Login');
      }
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const userData = decoded;
      // console.log(userData);
      const employee = await Employee.findById(userData.userId);
      const verified = await bcrypt.compare(req.body.password, employee.password)
      if(!verified){
        return res.status(401).json({
          message: 'Incorrect password'
        });
      }
      const hashedPassword = await bcrypt.hash(req.body.new_password, 13);
      employee.password = hashedPassword;

      await employee.save();
      
      res.status(201).json({
        message: "Password updated successfully",
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };





  return {
    viewProfile,
    updateProfile,
    updatePassword
  };
}

module.exports = profileController;
