
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , userMgr = require( "./local_modules/user-manager" )
  , http = require('http')
  , path = require('path')
  , commander = require('commander');

commander
  .version('0.0.1')
  .option('-fbci, --FB_CLIENT_ID [client id]', 'Facebook client id')
  .option('-fbcs, --FB_CLIENT_SECRET [client secret]', 'Facebook client secert')
  .parse(process.argv);

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;


console.log(commander.FB_CLIENT_SECRET);
console.log(commander.FB_CLIENT_ID);

passport.use(new FacebookStrategy({
    clientID: commander.FB_CLIENT_ID || process.env.FB_CLIENT_ID,
    clientSecret: commander.FB_CLIENT_SECRET || process.env.FB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, callback) {
   	userMgr.findOrCreate(accessToken, refreshToken, profile, callback);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser()); 
app.use(express.session({ secret: process.env.SESSION_SECRECT || 'hacked4sure' }));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// passport 
app.get('/auth/facebook', 
	passport.authenticate('facebook', {scope : ['email']})
);

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/facebook-sucess',
                                      failureRedirect: '/facebook-failure' }));

app.get('/', routes.index);
app.get('/login', login.login);
app.get('/login-required', login.loginRequired);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
