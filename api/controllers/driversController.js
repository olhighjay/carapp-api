const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const { query } = require('express-validator');


function driversController(Driver) {

  async function getDrivers(req, res, next){
    try{
      const filter = {};
      if(req.query.category){
        filter.category = req.query.category;
      };
      if(req.query.status){
        filter.status = req.query.status;
      };
      filter.role = 'driver';
      filter.deleted_at = null;
      const drivers = await Driver.find(filter).populate('car').sort({firstName: 1}); // ascending
      
      const response =  drivers && drivers.map(finaldriver => {
        let showdriver = {
          driver: finaldriver, 
          request: {
            type: 'GET',
            url: `http://${req.headers.host}/api/drivers/${finaldriver._id}`,
            viewByStatus: `http://${req.headers.host}/api/drivers?role=${finaldriver.role}`,
            viewByCategory: `http://${req.headers.host}/api/drivers?category=${finaldriver.category}`
          }
        };
        return showdriver;
      });
      
      res.status(200).json({
        count: drivers.length,
        drivers:  response
      });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };


  async   function getDriverById(req, res, next){
    const id = req.params.driverId;
    try{
      const check = {_id:id, deleted_at:null, role: 'driver'};
     
      const driver = await Driver.find(check).populate('car').sort({firstName: 1}); // ascending
      // .select("product quantity _id")
      // const user = populate('user');
      // const posts = await Post.find({author: user._id}).select("title")
        console.log(driver);
        if(driver.length > 0){
          res.status(200).json({
            driver : {
            "category": driver[0].category,
            "_id": driver[0]._id,
            "firstName": driver[0].firstName,
            "lastName": driver[0].lastName,
            "email": driver[0].email,
            "phone_number": driver[0].phone_number,
            "role": driver[0].role,
            "display_picture" : driver[0].display_picture,
            "createdAt": driver[0].createdAt,
            "updatedAt": driver[0].updatedAt,
              "car": driver[0].car
            },
            // writtenPosts: {
            //   // count: posts.length,
            //   driver
            // },
            request: {
              type: 'GET',
              description: 'Get all the users', 
              url: 'http://localhost:4000/api/drivers/'
            }
          });
        }
        else{
          res.status(404).json({
            error: "driver not found"
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


  async function updateDriver(req, res, next){
    
    const id = req.params.driverId;
    const update = req.body;
    const updateToArray = Object.keys(update);
   
    try{
      const filter = {};
      filter._id = id;
      filter.role = 'driver';
      filter.deleted_at = null;

     const driver = await Driver.find(filter);
      // console.log(driver);
      if(driver.length < 1){
        return res.status(404).json({
          error: "driver not found"
        });
      }

      updateToArray.forEach(key => {
        driver[0][key] = update[key];
      });

      if(req.file){
        // delete the image from storage
        if(driver[0].display_picture){
          fs.unlink( driver[0].display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        driver[0].display_picture = req.file.path;
      }
      
      if(update.password){
        const hashedPassword = await bcrypt.hash(req.body.password, 13);
        driver[0].password = hashedPassword;
      }

      await driver[0].save();
      
      res.status(201).json({
        message: "driver updated successfully",
        driver : {
          "category": driver[0].category,
          "_id": driver[0]._id,
          "firstName": driver[0].firstName,
          "lastName": driver[0].lastName,
          "email": driver[0].email,
          "phone_number": driver[0].phone_number,
          "role": driver[0].role,
          "display_picture" : driver[0].display_picture,
          "createdAt": driver[0].createdAt,
          "updatedAt": driver[0].updatedAt,
          "car": driver[0].car
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


  async function deleteDriver(req, res, next){
    const id = req.params.driverId;
    try{
      const filter = {};
      filter._id = id;
      filter.role = 'driver';
      filter.deleted_at = null;

      const driver = await Driver.find(filter);
      // console.log(driver);
      if(driver.length < 1){
        return res.status(404).json({
          error: "driver does not exist"
        });
      }
      const now = new Date();
      driver[0].deleted_at = now;
      await driver[0].save();
      res.status(200).json({
        message: "driver deleted successfully",
        request: {
          type: 'POST',
          description: 'Create new driver', 
          url: 'http://localhost:4000/api/drivers/',
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
  };

  async function getMyDrivers(req, res, next){
    try{
      if(!req.headers.authorization){
        // console.log('Login asshole');
        throw new Error('User needs to Login');
      }
      const token = req.headers.authorization.split(" ")[1];
      const userData = jwt.verify(token, process.env.JWT_KEY);
      // console.log(userData);
      const employee = await Driver.findById(userData.userId);
      // console.log(employee);
      
      const filter = {};
      filter.role = 'driver';
      filter.deleted_at = null;
      filter.category = [employee.category, 'all'];
      const drivers = await Driver.find(filter).populate('car').sort({firstName: 1}); // ascending
      
      const response =  drivers && drivers.map(finaldriver => {
        let showdriver = {
          driver: finaldriver
        };
        return showdriver;
      });
      
      res.status(200).json({
        count: drivers.length,
        drivers:  response
      });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };




  return {
    getDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    getMyDrivers
  };
}

module.exports = driversController;
