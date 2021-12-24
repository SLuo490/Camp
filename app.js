const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const db = mongoose.connection;
const Campground = require('./models/campground');

// Connect to database
mongoose.connect('mongodb://localhost:27017/camp')
  .then(() => {
    console.log("Connection Open");
  })
  .catch(err => {
    console.log("Error");
    console.log(err);
  })

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('home');
})

// Test to see if code is connected to database
app.get('/makecampground', async (req, res) => {
  const camp = new Campground({
    title: "My Backyard",
    description: "Cheap camping"
  });
  await camp.save();
  res.send(camp);
})

app.listen(3000, () => {
  console.log("Serving on Port 3000");
})