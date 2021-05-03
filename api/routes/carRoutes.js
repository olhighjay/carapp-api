// require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
// const multer = require('multer');
const Car = require('../models/carModel');
// const Category = require('../models/categoryModel');
// const User = require('../models/userModel');
// const authWare = require('../middlewares/auth');
// const adminWare = require('../middlewares/adminAuth');
// const postWare = require('../middlewares/self-postAuth');
// const carsController = require('../controllers/carsController')(Post, Category, User);
const carsController = require('../controllers/carsController')(Car);
const router = express.Router();



router.get('/', carsController.get);
router.post('/', carsController.post);


module.exports = router;