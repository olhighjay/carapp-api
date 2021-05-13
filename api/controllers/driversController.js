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
        const drivers = await Driver.find({role: 'driver'});
        // console.log(drivers);
        if(req.query.category){
          query.category = req.query.category;
        }
        let filtereddrivers = drivers && drivers.filter(driver => {
          // console.log(post.category["name"]);
          if(driver.category !== undefined && !req.query.role){
            return driver.category === query.category
          }
        });
        let findrivers;
        const driversFunc = () => {
          if(req.query.category){
            findrivers =  filtereddrivers;
          }
          else{
            findrivers = drivers;
          }
          return findrivers
        }
        const finaldrivers = driversFunc();
        // console.log(postz);;
        const response =  finaldrivers && finaldrivers.map(finaldriver => {
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
          count: finaldrivers.length,
          drivers:  response
        });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };


  async function registerdriver(req, res, next){
    try{
      //check for email uniqueness
      const availableUser = await driver.find({ email: req.body.email });
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
    
      const driver = new driver({
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        password: hashedPassword,
        category: req.body.category,
      });
      await driver.save();
      res.status(201).json({
        message: 'driver was created successfully',
        createddriver: {
          driver: driver
        }
      });
    }
    catch(err) {
      res.status(500).json({
        error: err.message
      });
    };    
    
  };


  async   function getdriverById(req, res, next){
    const id = req.params.driverId;
    try{
     
      const driver = await driver.find({role: 'driver', _id:id});
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
            "role": driver[0].role,
            "createdAt": driver[0].createdAt,
            "updatedAt": driver[0].updatedAt,
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


  async function updatedriver(req, res, next){
    
    const id = req.params.driverId;
    const update = req.body;
    const updateToArray = Object.keys(update)
   
    try{
     const driver = await driver.find({role: 'driver', _id:id});
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
          "role": driver[0].role,
          "createdAt": driver[0].createdAt,
          "updatedAt": driver[0].updatedAt,
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


  async function signIn(req, res, next){
    
    try{
      //check for email uniqueness
      const driver = await driver.findOne({ email: req.body.email});
      if(!driver){
        return res.status(401).json({
          message: 'Auth Failed on email'
        });
      }
      
      const verified = await bcrypt.compare(req.body.password, driver.password)
      console.log(chalk.blue(verified));
      if(!verified){
        return res.status(401).json({
          message: 'Auth Failed on password'
        });
      }
      const token = jwt.sign({
        role: driver.role,
        category: driver.category,
        userId: driver._id
        }, process.env.JWT_KEY,
        {
          expiresIn: "100h"
        }
      );
      return res.status(200).json({
        message: 'Auth Successful',
        token:token,
        driver: driver
      });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
  };


  async function deletedriver(req, res, next){
    const id = req.params.driverId;
    try{
      const driver = await driver.find({role: 'driver', _id:id});
      // console.log(driver);
      if(driver.length < 1){
          return res.status(404).json({
            error: "driver does not exist"
          });
        }
        await driver[0].remove();
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
  }




  return {
    getDrivers,
    registerdriver,
    getdriverById,
    updatedriver,
    signIn,
    deletedriver
  };
}

module.exports = driversController;
