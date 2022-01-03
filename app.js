const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const Review = require('./models/review');
const Campground = require('./models/campground');
const { campgroundSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const db = mongoose.connection;

// Connect to database camp
mongoose
  .connect('mongodb://localhost:27017/camp')
  .then(() => {
    console.log('Connection Open');
  })
  .catch((err) => {
    console.log('Error');
    console.log(err);
  });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
  // Check if there is an error
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // map error and throw error with message
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {
      campgrounds,
    });
  })
);

// Create New Campground
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Show Campground with ID
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    res.render('campgrounds/show', {
      campground,
    });
  })
);

// Show Edit Campground Page
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {
      campground,
    });
  })
);

// Edit Campground
app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete Campground
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  })
);

// Review Route
app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Throw a error page for all paths that does not exist
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Show Error Page
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = 'Something Went Wrong';
  }
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Serving on Port 3000');
});
