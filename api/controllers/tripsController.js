const chalk = require('chalk');
const mongoose = require('mongoose');
const fs = require('fs'); 
const { response } = require('express');
const { query } = require('express-validator');
var moment = require('moment');
const { findById } = require('../models/tripModel');



function toTime(selectedTime, additionalTime){ 
  var dt = new Date(selectedTime);
  dt.setHours( dt.getHours() + additionalTime );
  return dt;
  
}

function tripsController(Trip, Car, Employee) {
    // async function get(req, res, next){
    //   try{
    //     const cars = await Car.find().sort({
    //       createdAt : -1   //descending order
    //   }).
    //   exec();
    //    // console.log(req.query);
    //   if(req.query.condition){
    //     query.condition = req.query.condition;
    //   };
    //   if(req.query.status){
    //     query.status = req.query.status;
    //   }
    //   if(req.query.category){
    //     query.category = req.query.category;
    //   }
    //   let filteredCar = cars && cars.filter(trip => {
    //      // console.log(post.category["name"]);
    //     if(trip.condition !== undefined && !req.query.status && !req.query.category){
    //       return trip.condition === query.condition
    //     }
    //     else if(trip.status !== undefined && !req.query.condition && !req.query.category){
    //       return trip.status === query.status
    //     }
    //     else if(trip.category !== undefined && !req.query.condition && !req.query.status){
    //       return trip.category === query.category
    //     }
    //   });
    //   let finCars;
    //   const carsFunc = () => {
    //     if(req.query.condition || req.query.status ||  req.query.category){
    //       finCars =  filteredCar;
    //     }
    //     else{
    //       finCars = cars;
    //     }
    //     return finCars
    //   }
    //   const finalCars = carsFunc();
    //    // console.log(postz);;
    //   const response =  finalCars && finalCars.map(finalCar => {
    //     let showCar = {
    //       trip: finalCar, 
    //       request: {
    //         type: 'GET',
    //         url: `http:  //${req.headers.host}/api/cars/${finalCar._id}`,
    //         viewByStatus: `http: //${req.headers.host}/api/cars?status=${finalCar.status}`,
    //         viewByCondition: `http:  //${req.headers.host}/api/cars?condition=${finalCar.condition}`,
    //         viewByCategory: `http: //${req.headers.host}/api/cars?category=${finalCar.category}`
    //       }
    //     };
    //     return showCar;
    //   })
    //    // };
    //   res.status(200).json({
    //     count: finalCars.length,
    //     Cars: response
    //   });
    // }

    // catch(err){
    //   console.log(err);
    //   res.status(500).json({error: err.message});
    // }
    // }
  async function post(req, res, next){
      /* The front end dev should show a list of drivers and cars that are 
      ** either available or booked but trips time not clashing
      */
      /* This feature shoule be available only to the admin and the list should only
      ** appear if the admin decides to pick the either or both the driver and car 
      */
     // Time should be in this format "start_time": "2018-06-09T12:34:00.000",
    try{
      var now = new Date();
      if(now > new Date(req.body.start_time) || now > new Date(req.body.end_time)){
        throw new Error("Invalid time. Past date or time should not be selected")
      }
      
      const trip = new Trip({
        _id: new mongoose.Types.ObjectId(),
        state: req.body.state,
        address: req.body.address,
        start_time: req.body.start_time,
        end_time: req.body.end_time
      });
      // trip.start_time_grace = toTime(req.body.start_time, -1);
      // trip.end_time_grace = toTime(req.body.end_time, 1);
      trip.start_time_grace = moment(trip.start_time).subtract(1, 'h').toDate(); 
      trip.end_time_grace = moment(trip.end_time).add(1, 'h').toDate();
      trip.extra_time_grace = moment(trip.start_time).add(15, 'm').toDate();
      

        
        // Get who is embarking on the trip
      if(req.body.employee) {
        trip.employee = req.body.employee
      } else {
        trip.employee = req.userData.userId
      }
      trip.creator = req.userData.userId;

      const employee = await Employee.findById(trip.employee);
      const employeeDrivers = await Employee.find({role: 'driver' , category: employee.category, status: ['available','booked']});
      const availableDrivers = await Employee.find({role: 'driver', category: employee.category, status: ['available']});
      const bookedDrivers = await Employee.find({role: 'driver', category: employee.category, status: 'booked'});

      const employeeCars = await Car.find({ category: employee.category, status: ['available','booked']});
      const availableCars = await Car.find({ category: employee.category, status: ['available']});
      const bookedCars = await Car.find({ category: employee.category, status: 'booked'});
      
      
      function ifBookedDriverOrCar(obj,objTrips) {
          // Get the booked trips that are not clashing with the current trip
        var freeTimeTrips = objTrips.filter(objTrip => {
        if(trip.start_time < objTrip.start_time && trip.end_time < objTrip.start_time_grace){
          return true
        }
        if(trip.start_time > objTrip.start_time && trip.start_time > objTrip.end_time_grace){
          return true
        }   
        })

         // Get the booked trips that are clashing with the current trip
        var clashingTimeTrips = objTrips.filter(objTrip => {
          if(trip.start_time <= objTrip.start_time && trip.end_time > objTrip.start_time_grace){
            return true
          }
          if(trip.start_time >= objTrip.start_time && trip.start_time < objTrip.end_time_grace){
            return true
          }   
        })
        // console.log(clashingTimeTrips);

        if(freeTimeTrips && freeTimeTrips.length < 1){
          throw new Error('No ' + obj + ' available')
        }

          // Get the drivers(id) of the booked trips that are not clashing
        if(obj == "driver"){
          var vacObjs = freeTimeTrips.map(freeTimeTrip => {
            return freeTimeTrip.driver;
          })
        } else if(obj == "car") {
          var vacObjs = freeTimeTrips.map(freeTimeTrip => {
            return freeTimeTrip.car;
          })
        }

        // Get the drivers(id) of the booked trips that are clashing
        if(obj == "driver"){
          var clashObjs = clashingTimeTrips.map(clashingTimeTrip => {
          return clashingTimeTrip.driver;
        })
        } else if(obj == "car") {
          var clashObjs = clashingTimeTrips.map(clashingTimeTrip => {
            return clashingTimeTrip.car;
          })
        }

         // Get the id of the drivers that are not clashing 
         if(clashObjs && clashObjs.length > 0){
          var vactObjs = clashObjs.filter(clashObj => {
            return vacObjs.includes(clashObj);
          });
         } else {
          var vactObjs = vacObjs
         }
         
        // console.log(vacObjs);
        // console.log(clashObjs);
        // console.log(vactObjs);

        if(vactObjs && vactObjs.length < 1) {
          throw new Error('All the ' + obj + 's are currently booked for this time, please pick a new time or date to be able to use the ' + obj + 's');
        }
          // Get the drivers(id) of the booked trip neglecting multiple occurence
        var counts = {};
        for (var i = 0; i < vactObjs.length; i++) {
          var num = vacObjs[i];
          counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
          // results are the ids of the drivers without registering an id more than once despite the driver having multiple booked trip
        var results = Object.keys(counts).map(i => counts[i])
          // min is the number of time the lowest occuring driver appeared
        var min = Math.min(...results);
          // Get the id(s) of the driver(s) with min 
        var vacantObjs = Object.keys(counts).filter(function(key) {
          if (counts[key] == min) {
            return true;
          }
        });

        return vacantObjs;
      }

      function availDriverOrCar(objLastTrips,objsIds) {
          
        console.log("Testing for");
            // Get the driver(id) of the last trips
        var lastTripsObjs = [];
        lastTripsObjs =  objLastTrips.map( objLastTrip => {
          return objLastTrip.driver;
        });

          // Stringify the ids of the drivers and of the last trip drivers
        var newObjIds = objsIds.map(objsId => objsId.toString());
        var newLastTripsObjs = lastTripsObjs.map(lastTripsObj => lastTripsObj.toString());
      
          // Get the id of the drivers that have not embarked on any trip lately
        var vacantObjs = newObjIds.filter(newObjId => {
          return !newLastTripsObjs.includes(newObjId);
        });

        return vacantObjs;

      }
      
       //  DO MIDDLEWARE TO ALLOW ONLY ADMIN AND SOME CATEGORIES TO CHOOSE THEIR DRIVER AND CAR
      if(req.driver) {
        trip.driver = req.driver
      } else {
        if(employeeDrivers.length > 0 ) {
            // If the employee has at least a driver in their category that is not unavailble
            // If there is at least a driver that is available for the employee, the drivers should be the available drivers
          if(availableDrivers.length > 0) {
            drivers = availableDrivers;
          } else {
              // If there is no driver that is available for the employee, then the drivers should be the booked drivers
            drivers = bookedDrivers;
          }


          console.log("There is a driver");
            // Get the ID of the drivers
          var driversIds = drivers.map(driver => {
            return driver._id;
          });

          
            // All the trips that the drivers have embarked on
          const previousTrips = await Trip.find({driver: driversIds, status: "completed"}).sort({
            ended_time : -1   // descending order
          }). exec();
          //drivaTrips are all tthe trips of the booked drivers
          var drivaTrips = await Trip.find({driver: driversIds, status: "booked"}).sort({
            createdAt : 1   // ascending order
          }). exec();

          // The last few trips the driver embarkend on that one of them did is yet to embark on 
          const driverLastTrips = previousTrips.slice(0, drivers.length - 1);


          var vacantDrivers;
            // If all the drivers are booked
            // We pick first in the drivers that have smallest booked trip(s) that their time are not clashing with the current trip time
          if(bookedDrivers == drivers) {
            console.log("We are working on the booked drivers");
            vacantDrivers = ifBookedDriverOrCar("driver", drivaTrips)

          }
              // And all or some of them are free, not booked
          else if(availableDrivers == drivers) {
              // If the drivers have embarked on more than one trip
              // We need to look for the driver that has gone for less trips in the last few trips
            if(previousTrips.length > 0) {
                vacantDrivers = availDriverOrCar(driverLastTrips,driversIds)
            } else {
                //If none of the drivers have embarked on any trip
                // And none of them is booked
                // Then all the drivers are vacant
              vacantDrivers = driversIds;
            }
          }



          
          
            // The driver for the trip is the first vacant driver
          var driver = vacantDrivers[0];
            // Response to give when all the drivers available are booked for the current time the new trip is booked for 
          // if(freeTimeTrips && freeTimeTrips.length < 1) {
          //   res.status(200).json({
          //     message: 'No driver available at the moment',
          //     driver: driver
          //   });
          // }else{
              // Else, response to give and the driver chosen by the system for a trip
        

          
        } else {
          console.log("No driver available");
          throw new Error("No driver available at the moment")
        }
        trip.driver = driver;
      }

      if(req.car) {
        trip.car = req.car
      } else {
        if(employeeCars.length > 0 ) {
          // If the employee has at least a driver in their category that is not unavailble
            // If there is at least a driver that is available for the employee, the drivers should be the available drivers
          if(availableCars.length > 0) {
            cars = availableCars;
          } else {
              // If there is no driver that is available for the employee, then the drivers should be the booked drivers
            cars = bookedCars;
          }


          console.log("There is a car");
            // Get the ID of the drivers
          var carsIds = cars.map(car => {
            return car._id;
          });
          
            // All the trips that the drivers have embarked on
          const carPreviousTrips = await Trip.find({car: carsIds, status: "completed"}).sort({
            ended_time : -1   // descending order
          }). exec();

          //drivaTrips are all tthe trips of the booked drivers
          var carTrips = await Trip.find({car: carsIds, status: "booked"}).sort({
            createdAt : 1   // ascending order
          }). exec();

          // The last few trips the driver embarkend on that one of them did is yet to embark on 
          const carLastTrips = carPreviousTrips.slice(0, cars.length - 1);

          
          var vacantCars;
              // If all the drivers are booked
          // We pick first in the drivers that have smallest booked trip(s) that their time are not clashing with the current trip time
          if(bookedCars == cars) {
            console.log("We are working on the booked cars");
            vacantCars = ifBookedDriverOrCar("car", carTrips)

          }
              // And all or some of them are free, not booked
          else if(availableCars == cars) {
              // If the drivers have embarked on more than one trip
              // We need to look for the driver that has gone for less trips in the last few trips
            if(carPreviousTrips.length > 0) {
              vacantCars = availDriverOrCar(carLastTrips,carsIds)
            } else {
                //If none of the drivers have embarked on any trip
                // And none of them is booked
                // Then all the drivers are vacant
                vacantCars = carsIds;
            }
          }
        
          
          var car = vacantCars[0];
        } else {
          console.log("No ar available");
          throw new Error("No car available at the moment")
        }
        trip.car = car
      }

      // If it's the admin that chooses the trip to be emergency, then the trip is confirmed already but if it is 
      // people with other roles, then the trip should not be confirmed until confirmed by the admin
      if(req.userData.role == "superadmin" || req.userData.role == "admin") {
        if(req.emergency){
          trip.emergency = true;
        }
        trip.status = "booked";
      } else {
        if(req.emergency) {
          trip.emergency = true;
          trip.confirmed = false;
          trip.status = "pending";
        } else {
          trip.status = "booked";
        }
      }

      //Update car and driver status
      // var updriver = await Employee.findById(driver);
      // updriver.status ='booked';
      // updriver.save();
      // var upcar = await Car.findById(car);
      // upcar.status ='booked';
      
      // upcar.save();

      // //save trip
      // trip.save();
        // console.log(req.userData);

      res.status(201).json({
        message: 'Trip created successfully',
        trip,
      });

        
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
    
  }

    // async   function getCarById(req, res, next){
    //   const id = req.params.carId;
    //   try{
     
    //     const trip = await Car.findById(id);
    //      // .select("product quantity _id")
    //      // const user = populate('user');
    //       if(trip){
    //         return res.status(200).json({
    //           Car: trip,
    //           request: {
    //             type: 'GET',
    //             Desrciption: "View all cars",
    //             url: req.headers.host + '/api/cars/' 
    //           }
    //         });
    //       }else{
    //         res.status(404).json({
    //           error: "Car not found"
    //         });

    //       }
        
      
     
    //   }
    //   catch(err){
    //     console.log(err.message);
    //     res.status(500).json({
    //       error: err.stack
    //     });
    //   }
    // };

    // async function updateCar(req, res, next){
   
    //   const id = req.params.carId;
    //   const update = req.body;
    //   const keysArray = Object.keys(update);
   
    //   try{
    //     const trip = await Car.findById(id);
    //      // return res.send(catg);
    //     if(!trip){
    //       return res.status(404).json({
    //         error: "Car not found"
    //       });
    //     }

    //     keysArray.forEach(key => {
    //       trip[key] = update[key];
    //     })
    //      //Update cover image
    //     if(req.file){
    //        // delete the image from storage
    //       if(trip.display_picture){
    //         fs.unlink( trip.display_picture, err => { 
    //           if(err){
    //             console.log(err);
    //           }
    //         });
    //       }
    //        // upload the image from  the database
    //       trip.display_picture = req.file.path;
    //     }

    //     await trip.save();
      
    //     res.status(201).json({
    //       message: "Car updated successfully",
    //       trip: trip
    //     });  
    //   }
    //   catch(err){
    //     console.log(err.message);
    //     res.status(500).json({
    //       error: err.message
    //     });
    //   }
    // };

    // async function deleteCar(req, res, next){
    //   const id = req.params.carId;
    //   try{
     
    //     const trip = await Car.findById(id);
    //       if(trip){
    //         if(trip.display_picture){
    //            // delete the image from storage
    //           fs.unlink( trip.display_picture, err => { 
    //             if(err){
    //               console.log(err);
    //             }
    //           });
    //         }
    //         await trip.remove();
    //         res.status(200).json({
    //           message: "Car deleted successfully",
    //           request: {
    //             type: 'POST',
    //             description: 'Create new post', 
    //             url: 'http:  //localhost:4000/api/cars/',
    //             body: {
    //               title: 'String, required',
    //               body: 'String, required',
    //               plate_number: 'String, required',
    //               brand: 'String',
    //               model: 'String',
    //               color: 'String',
    //               properties: 'String',
    //               condition: 'String',
    //               status: 'String',
    //               category: 'String',
    //               display_picture: 'image, min-5mb, jpg-jpeg-png',
    //             }
    //           }
    //         });
    //       }
    //       else{
    //         res.status(404).json({
    //           error: "Post not found"
    //         });

    //       }
        
      
     
    //   }
    //   catch(err){
    //     console.log(err.message);
    //     res.status(500).json({
    //       error: err.stack
    //     });
    //   }
    // }



  return {
      // get,
    post,
      // getCarById,
      // updateCar,
      // deleteCar
  };
};

module.exports = tripsController;