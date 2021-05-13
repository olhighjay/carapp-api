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
        const employees = await Employee.find({role: 'employee'});
        
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
            employee: finalEmployee, 
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


  async   function getEmployeeById(req, res, next){
    const id = req.params.employeeId;
    try{
     
      const employee = await Employee.find({role: 'employee', _id:id});
      // .select("product quantity _id")
      // const user = populate('user');
      // const posts = await Post.find({author: user._id}).select("title")
        console.log(employee);
        if(employee.length > 0){
          res.status(200).json({
            employee : {
            "category": employee[0].category,
            "_id": employee[0]._id,
            "firstName": employee[0].firstName,
            "lastName": employee[0].lastName,
            "email": employee[0].email,
            "role": employee[0].role,
            "createdAt": employee[0].createdAt,
            "updatedAt": employee[0].updatedAt,
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
            error: "Employee not found"
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
     const employee = await Employee.find({role: 'employee', _id:id});
      // console.log(employee);
      if(employee.length < 1){
        return res.status(404).json({
          error: "Employee not found"
        });
      }

      updateToArray.forEach(key => {
        employee[0][key] = update[key];
      });

      if(req.file){
        // delete the image from storage
        if(employee[0].display_picture){
          fs.unlink( employee[0].display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        employee[0].display_picture = req.file.path;
      }
      
      if(update.password){
        const hashedPassword = await bcrypt.hash(req.body.password, 13);
        employee[0].password = hashedPassword;
      }

      await employee[0].save();
      
      res.status(201).json({
        message: "Employee updated successfully",
        employee : {
          "category": employee[0].category,
          "_id": employee[0]._id,
          "firstName": employee[0].firstName,
          "lastName": employee[0].lastName,
          "email": employee[0].email,
          "role": employee[0].role,
          "createdAt": employee[0].createdAt,
          "updatedAt": employee[0].updatedAt,
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


  async function deleteEmployee(req, res, next){
    const id = req.params.employeeId;
    try{
      const employee = await Employee.find({role: 'employee', _id:id});
      // console.log(employee);
      if(employee.length < 1){
          return res.status(404).json({
            error: "Employee does not exist"
          });
        }
        await employee[0].remove();
        res.status(200).json({
          message: "Employee deleted successfully",
          request: {
            type: 'POST',
            description: 'Create new employee', 
            url: 'http://localhost:4000/api/employees/',
            body: {
              firstName: 'String, required',
              lastName: 'String, required',
              email: 'String, required, unique',
              password: 'String, required',
              role: 'String',
              category: 'String',
            }
          }
        });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
  }




  return {
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
  };
}

module.exports = employeesController;
