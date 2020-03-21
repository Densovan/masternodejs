const express = require('express');
const dotenv = require('dotenv');

//Laod env vars
dotenv.config({ path: './config/config.env' });

const app = express();

app.get('/', (req, res) => {
  res.send('hello from express');
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Servers running in ${process.env.NODE_ENV} mode on Port ${PORT}`)
);
