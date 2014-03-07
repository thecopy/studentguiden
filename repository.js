var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var config = require('./config');

var getDb = function(fn){
	MongoClient.connect(config.hostname, fn);
}

var getEvents = function(from, to, nation, fields, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	var constraints = 	{
						  		date: { $gte : from, $lte: to }
						  	};

		if(nation != null || nation != undefined){
			constraints.location = nation.toLowerCase();
		}

	  	console.log("Fetching all events between " + from 
	  		+ " and " + to 
	  		+ " for nation '" + constraints.location + "'");
	  	

		var stream = null;
		if(!fields)
	  		stream = collection.find(constraints).sort({date: 1}).stream();
		else
	  		stream = collection.find(constraints, fields).sort({date: 1}).stream();

		stream.on('error', function(err) {  
			 console.log(err);
			 db.close();
		});

		fn(stream,db);
	});
}

var addEvents = function(events, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	var count = 0;
	  	if(events){
	  		count = events.length;
	  		events.forEach(function(e){
	  			e.location = e.location.toLowerCase();
	  		});
	  	}

	  	console.log("Adding " + count + " events...");
	  	console.dir(events);
	  	collection.insert(events, {w:1}, function(err, count){
	  		db.close();
	  		fn(err, count);
	  	});
  	});
}

var updateEvent = function(event, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	console.log("Updating event " + event.eventid + "...");
	  	
	  	collection.update(
	  		{eventid : event.eventid},	// query
	  		{ $set: {  					// new content
	  			content: event.content,
	  			title: event.title
	  		}},
	  		{w:1}, function(err, count){
		  		db.close();
		  		fn(err, count);
	  	});
  	});
}


var getEvent = function(id, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	console.log("Getting content for event " + id + "...");
	  	
	  	collection.findOne({_id: new ObjectID(id)}, fn);
  	});
}



module.exports.getEvent = getEvent;
module.exports.updateEvent = updateEvent;
module.exports.getEvents = getEvents;
module.exports.addEvents = addEvents;
