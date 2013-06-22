
var crypto 		= require('crypto')
var Db 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var port 		= 27017;
var host 		= 'localhost';
var name 		= 'noded-and-loaded';

/* establish the database connection */

var db = new Db(name, new Server(host, port, {auto_reconnect: true}), {w: 1});
  db.open(function(e, d){
  if (e) {
    console.log(e);
  }	else{
    console.log('connected to database :: ' + name);
  }
});
var users = db.collection('users');

exports.findOrCreate = function(accessToken, refreshToken, profile, callback) {
	var user = {
		id: 20384029384,
		auths: {}
	};
	console.log(profile);
	user.auths[profile.provider] = { 
   			'accessToken': accessToken,
   			'profile': profile,
   			'refreshToken': refreshToken
   	};
   console.log(user);
   callback(null, user);
 };