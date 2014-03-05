var MongoClient = require('mongodb').MongoClient;

var connectionString = "mongodb://localhost:27017/studentguiden";
var eventCollectionName = "events";

var getEvents = function(from, to, nation, fn){
	MongoClient.connect(connectionString, function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(eventCollectionName);

	  	console.log("Fetching all events between " + from + " and " + to);
	  	
	  	var constraints = 	{
						  		date: { $gte : from },
						  		date : { $lte: to }
						  	};

		if(nation != null || nation != undefined){
			contraints.nation = { $eq : nation };
		}

	  	var stream = collection.find(constraints)
				  	.stream();

		fn(stream);
	});
}

var addEvents = function(events, fn){
	MongoClient.connect(connectionString, function(err, db) {
	  	if(err) { throw new Error(err); }

	  	var collection = db.collection(eventCollectionName);

	  	console.log("Adding " +events.length + " events...");
	  	
	  	collection.insert(events, {w:1}, fn);
  	});
}


module.exports.getEvents = getEvents;
module.exports.addEvents = addEvents;
