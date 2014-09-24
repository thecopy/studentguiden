var MongoClient = require('mongodb').MongoClient;
var config = require('./config');
var URL = require('url');

var getDb = function(fn){
	MongoClient.connect(config.hostname, fn);
}

module.exports = function(req, res, next){

	getDb(function(err, db) {
	  	if(err) { console.error(err); return; }

	  	var collection = db.collection(config.statsCollectionName);
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
		    req.socket.remoteAddress || req.connection.socket.remoteAddress;

		var date = new Date();
		date.setHours(0,0,0,0)
	  	var logEntry = {
	  		day: date,
	  		date: new Date(),
	  		url: req.url,
	  		ip: ip
	  	};

	  	collection.insert(logEntry, {w:1}, function(err, count){
	  		db.close();
	  		if(err){
	  			console.error(err);
	  		}
	  		if(count == 0){
	  			console.error("For some reasong the log entry was not saved in DB");
	  		}else{
	  			console.log("Logged request");
	  		}
	  	});
		  
  	});
	
	next();
}