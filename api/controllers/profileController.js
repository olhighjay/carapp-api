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


  // async function updateEmployee(req, res, next){
    
  //   const id = req.params.employeeId;
  //   const update = req.body;
  //   const updateToArray = Object.keys(update)
   
  //   try{
  //     const filter = {};
  //     filter._id = id;
  //     filter.role = 'employee';
  //     filter.deleted_at = null;

  //     const employee = await Employee.find(filter);
  //     // console.log(employee);
  //     if(employee.length < 1){
  //       console.log('no data');
  //       return res.status(404).json({
  //         error: "Employee not found"
  //       });
  //     }

  //     updateToArray.forEach(key => {
  //       employee[0][key] = update[key];
  //     });

  //     if(req.file){
  //       // delete the image from storage
  //       if(employee[0].display_picture){
  //         fs.unlink( employee[0].display_picture, err => { 
  //           if(err){
  //             console.log(err);
  //           }
  //         });
  //       }
  //       // upload the image from  the database
  //       employee[0].display_picture = req.file.path;
  //     }
      
  //     if(update.password){
  //       const hashedPassword = await bcrypt.hash(req.body.password, 13);
  //       employee[0].password = hashedPassword;
  //     }

  //     await employee[0].save();
      
  //     res.status(201).json({
  //       message: "Employee updated successfully",
  //       employee : {
  //         "category": employee[0].category,
  //         "_id": employee[0]._id,
  //         "firstName": employee[0].firstName,
  //         "lastName": employee[0].lastName,
  //         "email": employee[0].email,
  //         "role": employee[0].role,
  //         "createdAt": employee[0].createdAt,
  //         "updatedAt": employee[0].updatedAt,
  //         }
  //     });  
  //   }
  //   catch(err){
  //     console.log(err.message);
  //     res.status(500).json({
  //       error: err.message
  //     });
  //   }
  // };





  return {
    viewProfile,
    // updateEmployee,
  };
}

module.exports = profileController;
