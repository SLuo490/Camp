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
const MongoStore = require('connect-mongo');

// Time
const moment = require('moment');

// Security
const mongoSanitize = require('express-mongo-sanitize');

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
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp';

mongoose
  .connect(dbUrl)
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
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

app.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on Port ${port}`);
});
