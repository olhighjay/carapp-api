const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { query } = require('express-validator');


function employeesController(Employee) {

  async function getEmployees(req, res, next){
    try{
        const employees = await Employee.find();
        
        if(req.query.role){
          query.role = req.query.role;
        };
        if(req.query.category){
          query.category = req.query.category;
        }
        let filteredEmployees = employees && employees.filter(employee => {
          // console.log(post.category["name"]);
          if(employee.role !== undefined && !req.query.category){
            return employee.role === query.role
          }
          else if(employee.category !== undefined && !req.query.role){
            return employee.category === query.category
          }
        });
        let finEmployees;
        const employeesFunc = () => {
          if(req.query.role ||  req.query.category){
            finEmployees =  filteredEmployees;
          }
          else{
            finEmployees = employees;
          }
          return finEmployees
        }
        const finalEmployees = employeesFunc();
        // console.log(postz);;
        const response =  finalEmployees && finalEmployees.map(finalEmployee => {
          let showEmployee = {
            car: finalEmployee, 
            request: {
              type: 'GET',
              url: `http://${req.headers.host}/api/employees/${finalEmployee._id}`,
              viewByStatus: `http://${req.headers.host}/api/employees?role=${finalEmployee.role}`,
              viewByCategory: `http://${req.headers.host}/api/employees?category=${finalEmployee.category}`
            }
          };
          return showEmployee;
        });
        
        res.status(200).json({
          count: finalEmployees.length,
          employees:  response
        });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };


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


  async   function getEmployeeById(req, res, next){
    const id = req.params.employeeId;
    try{
     
      const employee = await Employee.findById(id);
      // .select("product quantity _id")
      // const user = populate('user');
      // const posts = await Post.find({author: user._id}).select("title")
        // console.log(posts);
        if(employee){
          res.status(200).json({
            employee : {
            "category": employee.category,
            "_id": employee._id,
            "firstName": employee.firstName,
            "lastName": employee.lastName,
            "email": employee.email,
            "role": employee.role,
            "createdAt": employee.createdAt,
            "updatedAt": employee.updatedAt,
            },
            // writtenPosts: {
            //   // count: posts.length,
            //   employee
            // },
            request: {
              type: 'GET',
              description: 'Get all the users', 
              url: 'http://localhost:4000/api/employees/'
            }
          });
        }
        else{
          res.status(404).json({
            error: "User not found"
          });

        }
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };


  async function updateEmployee(req, res, next){
    
    const id = req.params.employeeId;
    const update = req.body;
    const updateToArray = Object.keys(update)
   
    try{
      const employee = await Employee.findById(id);
      // return res.send(catg);
      if(!employee){
        return res.status(404).json({
          error: "Employee not found"
        });
      }

      updateToArray.forEach(key => {
        employee[key] = update[key];
      });

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
      
      if(update.password){
        const hashedPassword = await bcrypt.hash(req.body.password, 13);
        employee.password = hashedPassword;
      }

      await employee.save();
      
      res.status(201).json({
        message: "Employee updated successfully",
        Employee: employee
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
    getEmployees,
    registerEmployee,
    // signIn,
    getEmployeeById,
    updateEmployee,
    // getUserById,
    // deleteUser
  };
}

module.exports = employeesController;
