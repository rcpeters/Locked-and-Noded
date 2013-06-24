
var crypto 		= require('crypto')
var Db 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var port 		= 27017;
var host 		= 'localhost';
var name 		= 'lockedAndNoded';

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
var passAuths = db.collection('passport_auths');


function createByAuth(accessToken, refreshToken, profile, callback) {
	var user = {
		'familyName': profile.familyName,
		'displayName': profile.displayName,
		'emails': profile.emails,
		auths: {}
	};
	
	console.log(profile);
	insertPassAuth(accessToken, refreshToken, profile, function (err, doc) {
        if (err) callback(err, null);
        user.auths[profile.provider] = doc[0]._id;
        users.insert(user, {safe: true}, function(err,doc) {
        	if (err) callback(err, null);
        	console.log(doc[0]);
        	callback(null,doc[0]);
        	return;
        });
   	});    
};


function insertPassAuth(accessToken, refreshToken, profile, callback) {
    passAuths.insert({ 
   			'accessToken': accessToken,
   			'profile': profile,
   			'refreshToken': refreshToken
   	}, callback);		
};


function upsetPassAuth(accessToken, refreshToken, profile, callback) {
    passAuths.update( {'profile.provider':profile.provider, 'profile.id': profile.id}
    	,{ 'accessToken': accessToken,'profile': profile, 'refreshToken': refreshToken}
    	,{ upsert: true }
    	, callback);		
};



function updateByAuth(user, accessToken, refreshToken, profile, callback) {
	var  curEmails = new Array();
	for (i in user.emails) {
		curEmails.push(user.emails[i].value);
	}

	var hasNewEmail = false;
	for (i in profile.emails) {
		if (curEmails.indexOf(profile.emails[i].value) < 0)
			user.emails.push(profile.emails[i]);
	}
    
        users.update({ _id: user._id}, user, {safe: true}, function(err,doc) {
        	if (err) callback(err, null);
        	console.log(user);
        	callback(null,doc[0]);
        	return;
     });	
};


/* 
 * finds or creates a user from a passport.js auth 
 * returns callback(error, user) 
 */

exports.findOrCreateByAuth = function(accessToken, refreshToken, profile, callback) {
    var emails = new Array();
	for (i in profile.emails) {
		emails.push(profile.emails[i].value);
	}
    this.findByEmails(emails, function(err,user) {
    	if (err) console.log (err);
    	if ( user != null) {
    		console.log("User revisit: " + user._id);
    		updateByAuth(user, accessToken, refreshToken, profile, 
    			function() {
    				callback(null, user);
    				return;
    			});
    		return;
    	};
        createByAuth(accessToken, refreshToken, profile, callback);	
        return;
    });
};

exports.findById = function(id, callback)
{
	users.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.findByEmail = function(email, callback)
{
	users.findOne({emails: {$elemMatch: {value: email}}},
		function(err, res) {
		if (err) callback(e)
		else callback(null, res)
	});
};

exports.findByEmails = function(emailsArr, callback)
{
	users.findOne({'emails': {$elemMatch: {value: {$in: emailsArr}}}},
		function(err, res) {
		if (err) callback(e)
		else callback(null, res)
	});
};

var getObjectId = function(id)
{
	return users.db.bson_serializer.ObjectID.createFromHexString(id)
}
