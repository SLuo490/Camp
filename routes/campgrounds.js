const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router.get('/', catchAsync(campgrounds.index));

// Show Create New Campground Page
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Create New Campground
router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

// Show Campground
router.get('/:id', catchAsync(campgrounds.showCampground));

// Show Edit Campground Page
router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// Edit Campground
router.put(
  '/:id',
  validateCampground,
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.updateCampground)
);

// Delete Campground
router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
