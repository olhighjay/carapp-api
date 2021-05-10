// require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Car = require('../models/carModel');
// const Category = require('../models/categoryModel');
// const User = require('../models/userModel');
// const authWare = require('../middlewares/auth');
// const adminWare = require('../middlewares/adminAuth');
// const postWare = require('../middlewares/self-postAuth');
// const carsController = require('../controllers/carsController')(Post, Category, User);
const carsController = require('../controllers/carsController')(Car);
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


router.get('/', carsController.get);
router.post('/', upload.single('display_picture'), carsController.post);
router.get('/:carId', carsController.getCarById);
router.post('/:carId', upload.single('display_picture'), carsController.updateCar);
router.delete('/:carId', carsController.deleteCar);



module.exports = router;