require('./api/db/mongoose');
require("dotenv").config();
const config = require('./api/db/_config');
const express = require('express');
// const morgan =  require('morgan');
const mongoose =  require('mongoose');
const chalk = require('chalk');
const app = express();


const authRouter = require('./api/routes/authRoutes');
const carRouter = require('./api/routes/carRoutes');
const employeeRouter = require('./api/routes/employeeRoutes');
const driverRouter = require('./api/routes/driverRoutes');
const adminRouter = require('./api/routes/adminRoutes');
const roleRouter = require('./api/routes/roleRoutes');
const tripRouter = require('./api/routes/tripRoutes');
const profileRouter = require('./api/routes/profileRoutes');

// var expressBusboy = require('express-busboy');
// expressBusboy.extend(app);



//make the folder public
app.use('/api/public/images', express.static('api/public/images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if(req.method === 'OPTIONS'){
    res.header("Access-Control-Allow-Methods", 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
})


app.use('/api/', authRouter);
app.use('/api/', profileRouter);
app.use('/api/', carRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/', driverRouter);
app.use('/api/admins', adminRouter);
app.use('/api/roles', roleRouter);
app.use('/api/trips', tripRouter);


app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status =404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});




const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server is running on ${port}`);
// });

app.server = app.listen(port, () => {
  console.log(new Date(Date.now()).toLocaleTimeString());
  console.log(chalk.blue('Running on port ' + port));
  console.log(app.settings.env);
  // console.log(JSON.stringify(process.env.NODE_ENV));
  console.log(config["mongoURI"][process.env.NODE_ENV]);
});





module.exports = app;