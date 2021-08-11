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
  async function get(req, res, next){
    try{
      
      const filter = {};
       if(req.query.emergency){
        filter.emergency = req.query.emergency;
      };
      if(req.query.confirmed){
        filter.confirmed = req.query.confirmed;
      };
      if(req.query.status){
        filter.status = req.query.status;
      };
      if(req.query.accident){
        filter.accident = req.query.accident;
      };
      if(req.query.employee){
        filter.employee = req.query.employee;
      };
      if(req.query.driver){
        filter.driver = req.query.driver;
      };
      if(req.query.car){
        filter.car = req.query.car;
      };
      // console.log(filter);
      
        const trips = await Trip.find(filter).populate(["car", "driver", "employee", "creator"]).sort({
          createdAt : -1   //descending order
      }).
      exec();
      
      
      const response =  trips && trips.map(trip => {
        let showTrips = {
          trip: trip, 
          request: {
            type: 'GET',
            url: `http://${req.headers.host}/api/trips/${trip._id}`,
            viewByStatus: `http://${req.headers.host}/api/trips?status=${trip.status}`,
            ViewEmergencyTrips: `http://${req.headers.host}/trips?emergency=true`,
            viewTripsByCar: `http://${req.headers.host}/trips/car=${trip.car._id}`,
            viewTripsByEmployee: `http://${req.headers.host}/trips/car=${trip.employee._id}`,
            // viewTripsByDriver: `http://${req.headers.host}/trips/car=${finalTrip.driver._id}`
          }
        };
        return showTrips;
      })
       // };
      res.status(200).json({
        count: trips.length,
        Trips: response
      });
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }

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
      // Who created the trip
      trip.creator = req.userData.userId;

      const employee = await Employee.findById(trip.employee);
      if(req.body.driver) {
        var drivva = req.body.driver;
        var drivvaTrips = await Trip.find({driver: drivva, status: 'booked'});
        // Get the booked trips that are clashing with the current trip
        var clashingDrivvaTimeTrips = drivvaTrips.filter(drivvaTrip => {
          if(trip.start_time <= drivvaTrip.start_time && trip.end_time > drivvaTrip.start_time_grace){
            return true
          }
          if(trip.start_time >= drivvaTrip.start_time && trip.start_time < drivvaTrip.end_time_grace){
            return true
          }   
        })
      }

      if(req.body.car) {
        var carr = req.body.car;
        var carrTrips = await Trip.find({driver: carr, status: 'booked'});
        // Get the booked trips that are clashing with the current trip
        var clashingCarrTimeTrips = carrTrips.filter(carrTrip => {
          if(trip.start_time <= carrTrip.start_time && trip.end_time > carrTrip.start_time_grace){
            return true
          }
          if(trip.start_time >= carrTrip.start_time && trip.start_time < carrTrip.end_time_grace){
            return true
          }   
        })
      }

      const employeeDrivers = await Employee.find({role: 'driver' , category: [employee.category,'all'], status: ['available','booked'], deleted_at:null});
      const availableDrivers = await Employee.find({role: 'driver', category: [employee.category,'all'], status: ['available'], deleted_at:null});
      const bookedDrivers = await Employee.find({role: 'driver', category: [employee.category,'all'], status: 'booked', deleted_at:null});

      const employeeCars = await Car.find({ category: [employee.category,'all'], status: ['available','booked'], deleted_at: null});
      const availableCars = await Car.find({ category: [employee.category,'all'], status: ['available'], deleted_at:null});
      const bookedCars = await Car.find({ category: [employee.category,'all'], status: 'booked', deleted_at:null});
      
      // Function to differentiate between 2 arrays
      function arr_diff (a1, a2) {

        var a = [], diff = [];
    
        for (var i = 0; i < a1.length; i++) {
            a[a1[i]] = true;
        }
    
        for (var i = 0; i < a2.length; i++) {
            if (a[a2[i]]) {
                delete a[a2[i]];
            } else {
                a[a2[i]] = true;
            }
        }
    
        for (var k in a) {
            diff.push(k);
        }
    
        return diff;
      }

      // Function to count number of times each element of an array occurs
      function countArrayElements(arr) {
        var count = {};
        for (var i = 0; i < arr.length; i++) {
          var num = arr[i];
          count[num] = count[num] ? count[num] + 1 : 1;
        };
        return count;
      }

      // FInd the minimum occuring element in an array
      function findMin(objt) {
         // results are the ids of the drivers without registering an id more than once despite the driver having multiple booked trip
        var results = Object.keys(objt).map(i => objt[i])
         // min is the number of time the lowest occuring driver appeared
        var min = Math.min(...results);
         // Get the id(s) of the driver(s) that has gone on the lowest number of trips
        var vcantObjs = Object.keys(objt).filter(function(key) {
          if (objt[key] === min) {
            return true;
          }
        });

        return vcantObjs;
      }

      //todayTrips are all tthe today's booked trips created in the last 3 days
      var todayTrips = await Trip.find({
        status: "booked", 
        createdAt: { 
          $gte: new Date(new Date().getTime() - 1000 * 3600 * 24 * 3),
          $lt: new Date()
        },
        }).sort({createdAt : 1   // ascending order
      }). exec();

      // ids of the drivers of todayTrips
      var todayDrivaIdz = todayTrips.map(todayTrip => {
        return todayTrip.driver;
      })

      
      var countor = {};
      for (var i = 0; i < todayDrivaIdz.length; i++) {
        var num = todayDrivaIdz[i];
        countor[num] = countor[num] ? countor[num] + 1 : 1;
      };

      // Ids of the drivers of trips created in the last 3 days without counting recurence
      var todayDrivaIds = Object.keys(countor);
      console.log(todayDrivaIds);


        
      // ids of the cars of todayTrips
      var todayCarIdz = todayTrips.map(todayTrip => {
        return todayTrip.car;
      })
      var carCountor = countArrayElements(todayCarIdz);
      // for (var i = 0; i < todayCarIdz.length; i++) {
      //   var num = todayCarIdz[i];
      //   carCountor[num] = carCountor[num] ? carCountor[num] + 1 : 1;
      // };

      // Ids of the drivers of trips created in the last 3 days without counting recurence
      var todayCarIds = Object.keys(carCountor);
      console.log(todayCarIds);
      

      
      function ifBookedDriverOrCar(obj,objTrips, todayObjIds, counts, objsIds) {
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
        if(obj === "driver"){
          var vacObjs = freeTimeTrips.map(freeTimeTrip => {
            return freeTimeTrip.driver;
          }) 
        } else if(obj === "car") {
          var vacObjs = freeTimeTrips.map(freeTimeTrip => {
            return freeTimeTrip.car;
          })
        }

        // Get the drivers(id) of the booked trips that are clashing
        if(obj === "driver"){
          var clashObjz = clashingTimeTrips.map(clashingTimeTrip => {
          return clashingTimeTrip.driver;
        })
        } else if(obj === "car") {
          var clashObjz = clashingTimeTrips.map(clashingTimeTrip => {
            return clashingTimeTrip.car;
          })
        }
        // console.log(vacObjs);
        var clashObjza = countArrayElements(clashObjz);
        var clashObjs = Object.keys(clashObjza);

         // Get the id of the drivers that are not clashing and that are not among the drivers that are clashing
         //It's possible that a driver has trips that are not clashing witrh the current trip time and still have some other 
         //trips that are clashing with the currernt trip. So we are getting drivers that are not clashing in any of their trips
        //  console.log("Ade n de");
        //  console.log(clashObjs);
        //  console.log(todayObjIds);
         // if all the drivers have embarked on atleast a trip in the last 3 days
        if(todayObjIds && objsIds && todayObjIds.length >= objsIds.length){
          // If there is any of the drivers that are clashing with the current trip time
          if(clashObjs && clashObjs.length > 0){
            console.log("testing microphone");
            // vactObjs are the drivers that have embarked on trips in the last 3 days that are not clashing
            var vactObjs = arr_diff(clashObjs, todayObjIds);
          } else {
            console.log(" microphone");
            // vactObjs are the drivers with the least number of trips in the last 3 days
            var vactObjs = findMin(counts);
          }
        } // if there are drivers that have embarked on trips in the last 3 days but not up to the number of the total number of available drivers
        else if (todayObjIds && objsIds && todayObjIds.length > 0 && todayObjIds.length < objsIds.length ) {
          vacas = arr_diff(todayObjIds, objsIds);
          // If there is any of the drivers that are clashing with the current trip time
          if(clashObjs && clashObjs.length > 0){
            console.log("testing microphone again");
            // drivers that are not clashing
            var unclashed = arr_diff(clashObjs, objsIds);
            console.log(unclashed);
            // drivers that are not clashing and have not embarked on any trip in the last 3 days
            // var unToday = arr_diff(todayObjIds, unclashed);
            var unToday = unclashed.filter(unclash => {
              return !todayObjIds.includes(unclash);
            });
            // console.log("unToday");
            console.log(unToday);
            // If we have such drivers like untoday drivers, then they should be our drivers
            if(unToday.length > 0) {
              vactObjs = unToday;
            } // else it should be the drivers that are not clashing whether they have embarked on any trip in the last 3 days or not
            else {
              vactObjs = unclashed;
            }
          } // If no driver is clashing, our drivers shoukd be drivers that have not embarked on any trip in the last 3 days
          else {
            console.log(" microphone again o");
            vacas = arr_diff(todayObjIds, objsIds);
            var vactObjs = vacas;
          }
        } // If no driver has embarked on any trip in the last 3 days but there are drivers that are not clashing
        else if(vacObjs && vacObjs.length > 0){
          // if any of them is clashing, get the booked drivers that are not clashing. Those are our drivers
          if(clashObjs && clashObjs.length > 0){
            var vactObjs = clashObjs.filter(clashObj => {
              return vacObjs.includes(clashObj);
            });
          } // else, our drivers are the booked drivers that not clashing at all whether they have embarked ontrip in the last 3 days or not
          else {
            var vactObjs = vacObjs
          }
        } else {
          var vactObjs = vacObjs
        }

        console.log(vactObjs);
        console.log("soro");
        

        if(vactObjs && vactObjs.length < 1) {
          throw new Error('All the ' + obj + 's are currently booked for this time, please pick a new time or date to be able to use the ' + obj + 's');
        }
          // Get the vactObjs (drivers(id) of the booked trip that are not clashing at all) neglecting multiple occurence
        var counts = countArrayElements(vactObjs);
          // results are the ids of the drivers without registering an id more than once despite the driver having multiple booked trip
        // var results = Object.keys(counts).map(i => counts[i])
        //   // min is the number of time the lowest occuring driver appeared
        // var min = Math.min(...results);
        // min is the number of time the lowest occuring driver appeared
        // var vacantObjs = findMin(counts);
        //   // Get the id(s) of the driver(s) that has gone on the lowest number of trips
        // var vacantObjs = Object.keys(counts).filter(function(key) {
        //   if (counts[key] === min) {
        //     return true;
        //   }
        // });
        var vacantObjs = findMin(counts);
        // console.log(counts);

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
       // If the driver was chosen and he does not have any clashing trip. Then the driver sould be the driver for the trip
      if(clashingDrivvaTimeTrips && clashingDrivvaTimeTrips.length < 1) {
        var driver = req.body.driver
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
          if(bookedDrivers === drivers) {
            console.log("We are working on the booked drivers");
            vacantDrivers = ifBookedDriverOrCar("driver", drivaTrips, todayDrivaIds, countor, driversIds)

          }
              // And all or some of them are free, not booked
          else if(availableDrivers === drivers) {
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
      }

      // If the car was chosen and it does not have any clashing trip. Then the car sould be the car for the trip
      if(clashingCarrTimeTrips && clashingCarrTimeTrips.length < 1) {
        var car = req.body.car;
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

           var todayDrivaIds = todayTrips.map(todayTrip => {
            return todayTrip.driver;
          })

          // The last few trips the driver embarkend on that one of them did is yet to embark on 
          const carLastTrips = carPreviousTrips.slice(0, cars.length - 1);

          
          var vacantCars;
              // If all the drivers are booked
          // We pick first in the drivers that have smallest booked trip(s) that their time are not clashing with the current trip time
          if(bookedCars === cars) {
            console.log("We are working on the booked cars");
            vacantCars = ifBookedDriverOrCar("car", carTrips, todayCarIds, carCountor, carsIds);

          }
              // And all or some of them are free, not booked
          else if(availableCars === cars) {
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
      }

      // If it's the admin that chooses the trip to be emergency, then the trip is confirmed already but if it is 
      // people with other roles, then the trip should not be confirmed until confirmed by the admin
      if(req.userData.role === "superadmin" || req.userData.role === "admin") {
        if(req.body.emergency === "on"){
          trip.emergency = true;
        }
        trip.status = "booked";
      } else {
        if(req.body.emergency === "on") {
          trip.emergency = true;
          trip.confirmed = false;
          trip.status = "pending";
        } else {
          trip.status = "booked";
        }
      }

      // Save driver and save car
      trip.driver = driver;
      trip.car = car
      //Update car and driver status
      var updriver = await Employee.findById(driver);
      updriver.status ='booked';
      updriver.save();
      var upcar = await Car.findById(car);
      upcar.status ='booked';
      
      upcar.save();

      //save trip
      trip.save();

        console.log(new Date());
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

  async   function getTripById(req, res, next){
    const id = req.params.tripId;
    try{
    
      const trip = await Trip.findById(id).populate(["car", "driver", "employee", "creator"]);
        // .select("product quantity _id")
        // const user = populate('user');
        if(trip){
          return res.status(200).json({
            Trip: trip,
            request: {
              type: 'GET',
              Desrciption: "View all trips",
              url: req.headers.host + '/api/trips/' 
            }
          });
        }else{
          res.status(404).json({
            error: "Trip not found"
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

  async function updateTrip(req, res, next){
  
    const id = req.params.tripId;
    const update = req.body;
    const keysArray = Object.keys(update);
  
    try{
      const trip = await Trip.findById(id);
        // return res.send(catg);
      if(!trip){
        return res.status(404).json({
          error: "Car not found"
        });
      }

      keysArray.forEach(key => {
        trip[key] = update[key];
      })

      await trip.save();
    
      res.status(201).json({
        message: "Trip updated successfully",
        trip: trip
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };

  // To deleteany trip, just use the update trip endpoint and pass a datetime into the deleted_at column


  return {
    get,
    post,
    getTripById,
    updateTrip,
  };
};

module.exports = tripsController;