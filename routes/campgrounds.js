const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

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

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {
      campgrounds,
    });
  })
);

// Create New Campground
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Show Campground with ID
router.get(
  '/:id',
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
router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {
      campground,
    });
  })
);

// Edit Campground
router.put(
  '/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete Campground
router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
  })
);

module.exports = router;
