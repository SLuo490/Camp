if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const db = mongoose.connection;

// Routes
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const session = require('express-session');
const flash = require('connect-flash');

// User Authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // Expiration Date is a week from now
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to access flash(success/error)
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

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
