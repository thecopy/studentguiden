var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var config = require('./config');

var getDb = function(fn){
	MongoClient.connect(config.hostname, fn);
}

var getEvents = function(from, to, nation, fields, category, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	var constraints = 	{
						  		date: { $gte : from, $lte: to }
						  	};

		if(category != null){
			constraints.categories = { $in: category};
		}

		if(nation != null || nation != undefined){
			constraints.location = nation.toLowerCase();
		}

	  	console.log("Fetching all events between " + from 
	  		+ " and " + to 
	  		+ " for nation '" + constraints.location + "'");
	  	

		var stream = null;
		if(!fields)
	  		stream = collection.find(constraints).sort({date: 1, location: 1}).stream();
		else
	  		stream = collection.find(constraints, fields).sort({date: 1, location: 1}).stream();
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
	  	if(typeof events === 'undefined' || events === null){
	  		console.log("Events is undefined or null!")
	  		fn("Illformatted JSON",[]);
	  	}else{
		  	collection.insert(events, {w:1}, function(err, count){
		  		db.close();
		  		fn(err, count);
		  	});
		  }
  	});
}

var updateEvent = function(event, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	console.log("Updating event " + event.eventid + "...");

	  	var stuffToSet = { title: event.title };
	  	if(event.content != null){ stuffToSet.content = event.content; }
	  	if(event.categories != null){ stuffToSet.categories = event.categories; }

	  	collection.update(
	  		{eventid : event.eventid},	// query
	  		{ $set: stuffToSet},
	  		{w:1}, function(err, count){
		  		db.close();
		  		fn(err, count);
	  	});
  	});
}

var updateEventCategory = function(eventid, category, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.eventCollectionName);

	  	console.log("Updating event " + eventid + "...");
	  	var id = parseInt(eventid);
	  	var c = [ category ];
	  	collection.update(
	  		{ eventid: id },	// query
	  		{ $set: {  				
	  			categories: c
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

var getStats = function(from, to, fn){
	getDb(function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(config.statsCollectionName);
	  	
		// Do a Group by field a
		collection.group(
			['day'], 
			{'day':{'$gte':from, '$lte': to}}, 
			{"count":0}, 
			"function (obj, prev) { prev.count++; }", 
			fn);
  	});
}


module.exports.getEvent = getEvent;
module.exports.updateEvent = updateEvent;
module.exports.getEvents = getEvents;
module.exports.addEvents = addEvents;
module.exports.updateEventCategory = updateEventCategory;
module.exports.getStats = getStats;
