require('./api/db/mongoose');
// require("dotenv").config();
const config = require('./api/db/_config');
const express = require('express');
// const morgan =  require('morgan');
const bodyParser = require('body-parser');
const mongoose =  require('mongoose');
const chalk = require('chalk');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const carRouter = require('./api/routes/carRoutes');






app.use('/api/cars', carRouter);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server is running on ${port}`);
// });

app.server = app.listen(port, () => {
  console.log(chalk.blue('Running on port ' + port));
  console.log(app.settings.env);
  // console.log(JSON.stringify(process.env.NODE_ENV));
  console.log(config["mongoURI"][process.env.NODE_ENV]);
});


app.use('/api/cars', carRouter);




module.exports = app;