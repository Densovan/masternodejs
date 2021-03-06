const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//Routes files
const bootcamps = require('./routes/bootcamp');
const course = require('./routes/course');

//Laod env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

const app = express();

//Body Phaser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', course);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Servers running in ${process.env.NODE_ENV} mode on Port ${PORT}`.yellow
      .bold
  )
);

//Handle unhadled promise rejections
process.on(`unhandledRejection`, (err, Promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit proccess
  server.close(() => process.exit(1));
});
