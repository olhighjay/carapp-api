const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const { response } = require('express');
const { query } = require('express-validator');

function carsController(Car) {
  async function get(req, res, next){
    try{
      const cars = await Car.find().sort({
        createdAt : -1 //descending order
    }).
    exec();
    // console.log(req.query);
    if(req.query.condition){
      query.condition = req.query.condition;
    };
    if(req.query.status){
      query.status = req.query.status;
    }
    let filteredCar = cars && cars.filter(car => {
      // console.log(post.category["name"]);
      if(car.condition !== undefined && !req.query.status){
        return car.condition === query.condition
      }
      else if(car.status !== undefined && !req.query.condition ){
        return car.status === query.status
      }
    });
    let finCars;
    const carsFunc = () => {
      if(req.query.condition || req.query.status){
        finCars =  filteredCar;
      }
      else{
        finCars = cars;
      }
      return finCars
    }
    const finalCars = carsFunc();
    // console.log(postz);;
    const response =  finalCars && finalCars.map(finalCar => {
      let showCar = {
        car: finalCar, 
        request: {
          type: 'GET',
          // url: `http://${req.headers.host}/api/posts/${post._id}`,
          // viewByCategory: `http://${req.headers.host}/api/posts?category=${category}`
        }
      };
      return showCar;
    })
    // };
    res.status(200).json({
      count: finalCars.length,
      Cars: response
    });
  }

  catch(err){
    console.log(err);
    res.status(500).json({error: err.message});
  }
  }
  async function post(req, res, next){
    console.log("Here I am")
    console.log(req.body);
    // const id = req.body.category;
    try{
      // const category = await Category.findById(id);
      // // console.log(category);
      //   if(!category){
      //     return res.status(404).json({
      //       error: "Category does not exist"
      //     });
      //   }
        // console.log(category);
      const car = new Car({
        _id: new mongoose.Types.ObjectId(),
        plate_number: req.body.plate_number,
        brand: req.body.brand,
        model: req.body.model,
        color: req.body.color,
        properties: req.body.properties,
        condition: req.body.condition,
        status: req.body.status,
      });
      // if(req.file){
      //   post.coverImage= req.file.path;
      // }
      // post.author = req.userData.userId
      await car.save();
      // console.log(post);
      // console.log(post.user);
      res.status(201).json({
        message: 'Car was created successfully',
        car: car,
        request: {
          type: 'GET',
          url: 'http://localhost:4000/api/cars/' + car._id
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
    get,
    post,
  };
};

module.exports = carsController;