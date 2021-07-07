// require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Trip = require('../models/tripModel');
const Car = require('../models/carModel');
const Employee = require('../models/employeeModel');
// const Category = require('../models/categoryModel');
// const User = require('../models/userModel');
const authWare = require('../middlewares/auth');
// const adminWare = require('../middlewares/adminAuth');
// const carValidation = require('../middlewares/validateCar');
// const validationErrors = require('../middlewares/validationErrors');
// const carsController = require('../controllers/carsController')(Post, Category, User);
const tripsController = require('../controllers/tripsController')(Trip, Car, Employee);
const router = express.Router();



// IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './api/public/images/cars');
  },
  filename: function(req, file, cb){
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) =>{
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    // Store file
    cb(null, true);
  } else{
    // Do  not store file
    cb(new Error('only images with jpeg and png extensions can be uploaded'), false);
  }
};

const upload = multer({
  storage: storage, 
  limits:{
    fileSize: 1024 * 1024 *5
  },
  fileFilter: fileFilter
});
upload.any();


router.get('/', tripsController.get);
router.post('/', authWare, tripsController.post);
// router.get('/:carId', carsController.getCarById);
// router.post('/:carId', upload.single('display_picture'), carsController.updateCar);
// router.delete('/:carId', carsController.deleteCar);



module.exports = router;