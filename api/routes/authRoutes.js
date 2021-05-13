const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require("express-validator");
const authWare = require('../middlewares/auth');
// const adminWare = require('../middlewares/adminAuth');
// const postWare = require('../middlewares/self-postAuth');
const validationWare = require('../middlewares/validateEmployee');
const validationErrors = require('../middlewares/validationErrors');
const Employee = require('../models/employeeModel');
// const Post = require('../models/postModel');
// const employeesController = require('../controllers/employeesController')(User, Post);
const authController = require('../controllers/authController')(Employee);

const router = express.Router();




  router.post('/register',[validationWare], validationErrors, authController.registerEmployee);
  router.post('/login', authController.signIn);
 
  

module.exports = router;