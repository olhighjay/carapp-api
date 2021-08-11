// require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Car = require('../models/carModel');
// const Category = require('../models/categoryModel');
const Employee = require('../models/employeeModel');
// const authWare = require('../middlewares/auth');
// const adminWare = require('../middlewares/adminAuth');
const carValidation = require('../middlewares/validateCar');
const validationErrors = require('../middlewares/validationErrors');
// const carsController = require('../controllers/carsController')(Post, Category, User);
const carsController = require('../controllers/carsController')(Car, Employee);
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


router.get('/cars/', carsController.get);
router.post('/cars', [carValidation], validationErrors, upload.single('display_picture'), carsController.post);
router.get('/cars/:carId', carsController.getCarById);
router.post('/cars/:carId', upload.single('display_picture'), carsController.updateCar);
router.delete('/cars/:carId', carsController.deleteCar);
router.get('/mycars', carsController.getMyCars);



module.exports = router;