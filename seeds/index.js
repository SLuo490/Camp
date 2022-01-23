const mongoose = require('mongoose');
const Campground = require('../models/campground');
const db = mongoose.connection;
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

// Connect to database
mongoose
  .connect('mongodb://localhost:27017/camp')
  .then(() => {
    console.log('Connection Open');
  })
  .catch((err) => {
    console.log('Error');
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  // Delete all data in campground
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    // Create a 50 new camp with random city and state names
    const camp = new Campground({
      // Your User ID
      author: '61e57c463bda2b593ad37fc5',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quod reprehenderit molestiae, maiores repudiandae hic veritatis!',
      price,
      geometry: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dfrl0ds3b/image/upload/v1642522611/Camp/grwqedocnpqhnqyqn7qo.jpg',
          filename: 'Camp/grwqedocnpqhnqyqn7qo',
        },
        {
          url: 'https://res.cloudinary.com/dfrl0ds3b/image/upload/v1642522611/Camp/srsinwmepruzm2vb4yqa.jpg',
          filename: 'Camp/srsinwmepruzm2vb4yqa',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
