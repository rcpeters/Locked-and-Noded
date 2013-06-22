
/*
 * GET login page.
 */

exports.login = function(req, res){
  res.render('login', { title: 'Login' });
};

exports.loginRequired = function(req, res){
  res.render('login-required', { title: 'Login Required' });
};