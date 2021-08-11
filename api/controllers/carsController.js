const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const jwt = require('jsonwebtoken');

function carsController(Car, Employee) {
  async function get(req, res, next){
    try{
      const filter = {};

       if(req.query.condition){
        filter.condition = req.query.condition;
      };
      if(req.query.status){
        filter.status = req.query.status;
      };
      if(req.query.category){
        filter.category = req.query.category;
      };
      if(req.query.type){
        filter.type = req.query.type;
      };
      filter.deleted_at = null;
      // console.log(filter);
      
        const cars = await Car.find(filter).sort({
          createdAt : -1   //descending order
      }).
      exec();
      const response =  cars && cars.map(finalCar => {
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
      
      res.status(200).json({
        count: cars.length,
        Cars: response
      });
    }

    catch(err){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }
  async function post(req, res, next){
    // console.log(req.file);
    // console.log(req.body);
    // const id = req.body.category;
    try{
      const car = new Car({
        _id: new mongoose.Types.ObjectId(),
        plate_number: req.body.plate_number,
        brand: req.body.brand,
        model: req.body.model,
        color: req.body.color,
        properties: req.body.properties,
        condition: req.body.condition,
        type: req.body.type,
        status: req.body.status,
        category: req.body.category,
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
     const check = {_id:id, deleted_at:null};
      const car = await Car.find(check);
      // .select("product quantity _id")
      // const user = populate('user');
        if(car.length > 0){
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
      const filter = {};
      filter._id = id;
      filter.deleted_at = null;
      const car = await Car.find(filter);
      // return res.send(catg);
      if(car.length < 1){
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
        if(car[0].display_picture){
          fs.unlink( car[0].display_picture, err => { 
            if(err){
              console.log(err);
            }
          });
        }
        // upload the image from  the database
        car[0].display_picture = req.file.path;
      }

      // console.log(car);
      await car[0].save();
      
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
      const filter = {};
      filter._id = id;
      filter.deleted_at = null;
      const car = await Car.find(filter);
      if(car.length > 0){
        // if(car[0].display_picture){
        //   // delete the image from storage
        //   fs.unlink( car[0].display_picture, err => { 
        //     if(err){
        //       console.log(err);
        //     }
        //   });
        // }
        const now = new Date();
        car[0].deleted_at = now;
        await car[0].save();
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

  async function getMyCars(req, res, next){
    try{
      if(!req.headers.authorization){
        // console.log('Login asshole');
        throw new Error('User needs to Login');
      }
      const token = req.headers.authorization.split(" ")[1];
      const userData = jwt.verify(token, process.env.JWT_KEY);
      // console.log(userData);
      const employee = await Employee.findById(userData.userId);
      // console.log(employee);
      
      const filter = {};
      filter.deleted_at = null;
      filter.category = [employee.category, 'all'];
      const cars = await Car.find(filter).sort({firstName: 1}); // ascending
      
      const response =  cars && cars.map(car => {
        let showCar = {
          car: car
        };
        return showCar;
      });
      
      res.status(200).json({
        count: cars.length,
        cars:  response
      });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  };



  return {
    get,
    post,
    getCarById,
    updateCar,
    deleteCar,
    getMyCars
  };
};

module.exports = carsController;