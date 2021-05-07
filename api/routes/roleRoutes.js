const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Role = require('../models/roleModel');
const rolesController = require('../controllers/rolesController')(Role);
const router = express.Router();



router.post('/', rolesController.post);


module.exports = router;
