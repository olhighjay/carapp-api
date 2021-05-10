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
    if(req.query.category){
      query.category = req.query.category;
    }
    let filteredCar = cars && cars.filter(car => {
      // console.log(post.category["name"]);
      if(car.condition !== undefined && !req.query.status && !req.query.category){
        return car.condition === query.condition
      }
      else if(car.status !== undefined && !req.query.condition && !req.query.category){
        return car.status === query.status
      }
      else if(car.category !== undefined && !req.query.condition && !req.query.status){
        return car.category === query.category
      }
    });
    let finCars;
    const carsFunc = () => {
      if(req.query.condition || req.query.status ||  req.query.category){
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
          url: `http://${req.headers.host}/api/cars/${finalCar._id}`,
          viewByStatus: `http://${req.headers.host}/api/cars?status=${finalCar.status}`,
          viewByCondition: `http://${req.headers.host}/api/cars?condition=${finalCar.condition}`,
          viewByCategory: `http://${req.headers.host}/api/cars?category=${finalCar.category}`
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
    console.log(req.file);
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
        // console.log(req);
      const car = new Car({
        _id: new mongoose.Types.ObjectId(),
        plate_number: req.body.plate_number,
        brand: req.body.brand,
        model: req.body.model,
        color: req.body.color,
        properties: req.body.properties,
        condition: req.body.condition,
        status: req.body.status,
        category: req.body.category
      });
      if(req.file){
        car.display_picture= req.file.path;
      }
      console.log(car);
      // post.author = req.userData.userId
      await car.save();
      res.status(201).json({
        message: 'Car was created successfully',
        car: car,
        request: {
          type: 'GET',
          Desrciption: 'View car by id',
          url: req.headers.host + '/api/cars/' + car._id
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

  async   function getCarById(req, res, next){
    const id = req.params.carId;
    try{
     
      const car = await Car.findById(id);
      // .select("product quantity _id")
      // const user = populate('user');
        if(car){
          return res.status(200).json({
            Car: car,
            request: {
              type: 'GET',
              Desrciption: "View all cars",
              url: req.headers.host + '/api/cars/' 
            }
          });
        }else{
          res.status(404).json({
            error: "Car not found"
          });

        }
        
      
     
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.stack
      });
    }
  };

  async function updateCar(req, res, next){
   
    const id = req.params.carId;
    const update = req.body;
    const keysArray = Object.keys(update);
   
    try{
      const car = await Car.findById(id);
      // return res.send(catg);
      if(!car){
        return res.status(404).json({
          error: "Car not found"
        });
      }

      keysArray.forEach(key => {
        car[key] = update[key];
      })
      //Update cover image
      if(req.file){
        // delete the image from storage
        if(car.display_picture){
          fs.unlink( car.display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        car.display_picture = req.file.path;
      }

      await car.save();
      
      res.status(201).json({
        message: "Car updated successfully",
        car: car
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };

  async function deleteCar(req, res, next){
    const id = req.params.carId;
    try{
     
      const car = await Car.findById(id);
        if(car){
          if(car.display_picture){
            // delete the image from storage
            fs.unlink( car.display_picture, err => { 
              if(err){
                console.log(err);
              }
            });
          }
          await car.remove();
          res.status(200).json({
            message: "Car deleted successfully",
            request: {
              type: 'POST',
              description: 'Create new post', 
              url: 'http://localhost:4000/api/cars/',
              body: {
                title: 'String, required',
                body: 'String, required',
                plate_number: 'String, required',
                brand: 'String',
                model: 'String',
                color: 'String',
                properties: 'String',
                condition: 'String',
                status: 'String',
                category: 'String',
                display_picture: 'image, max-5mb, jpg-jpeg-png',
              }
            }
          });
        }
        else{
          res.status(404).json({
            error: "Post not found"
          });

        }
        
      
     
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.stack
      });
    }
  }



  return {
    get,
    post,
    getCarById,
    updateCar,
    deleteCar
  };
};

module.exports = carsController;