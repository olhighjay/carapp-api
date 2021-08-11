const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require("express-validator");
const authWare = require('../middlewares/auth');
const Employee = require('../models/employeeModel');
const profileController = require('../controllers/profileController')(Employee);

const router = express.Router();


// IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './api/public/images/employees');
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



  router.get('/profile',profileController.viewProfile);
  router.post('/profile', upload.single('display_picture'), profileController.updateProfile);
  router.post('/profile/pass',  profileController.updatePassword);

module.exports = router;