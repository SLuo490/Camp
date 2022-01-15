module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Store url they are requesting
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in');
    return res.redirect('/login');
  }
  next();
};
