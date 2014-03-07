var repository = require("./repository");
var URL = require('url');

module.exports = function(req, res){
console.log(req.url.charAt(11));
	if(req.url.substr(0,11) == '/api/events'){
		if(req.method == 'GET')
			if(req.url.charAt(11) == '/') // no event-id specified
				get_event_content(req,res);
			else
				get_events(req,res);
		else if(req.method == 'POST')
			post_events(req,res);
		else if(req.method == 'PUT')
			update_event(req,res);
	}else{
			setError(res, 400, "Invalid request for api parser: " + req.url);
	}
}

function post_events(req,res){
	events = req.body.events;
	repository.addEvents(events, function(err, result){
		var count = 0;
		if(result != undefined) count = result.length;

		console.log("Added " + count + " events. Error: " + err);

		if(err){
			setError(res, 400, err.toString());
		}else{
			res.end("ok:" + count);
		}
	});
}

function get_event_content(req,res){
	var id = req.url.substr(12);
	if(id == undefined || id == null){
		setError(res, 400, "invalid id");
		return;
	}
	var info = repository.getEvent(id, function(err, item){
		if(err){
			setError(res, 500, err.toString());
		}else{
			res.end(item.content);
		}
	})
}

function get_events(req,res){
	var query = URL.parse(req.url, true).query;

	var from = convertDateToUTC(new Date(query.from));
	var to = convertDateToUTC(new Date(query.to));
	
	var nation = query.nation;
	var fields = query.fields;

	if(from == null || to == null){
		setError(res, 400, "from and to parameters cannot be null!");
		return;
	}

	repository.getEvents(from, to, nation, fields, function(stream,db){

		if(!stream)
		{
			setError(res, 500, "Did not get stream object from repository!");
			return;
		}

		var result = [];

		stream.on('data', function(eventItem){
			result.push(eventItem);
		});

		stream.on('close', function() {
			res.end(JSON.stringify(result)); 
			db.close();
		});
	});
}


function update_event(req,res){

	var eventid = parseInt(req.url.substr(12));

	var event = req.body;
	if(event == null 
		|| typeof eventid != 'number'
		|| event.content == null
		|| event.title == null){
		
		setError(res, 400, "Invalid request. Please provide an event with 'eventid', 'content' and 'title'.");
		return;
	}

	event.eventid = eventid;

	repository.updateEvent(event, function(err, result){

		if(err)
		{
			setError(res, 500, err.toString());
			return;
		}
		
		res.end("ok:" + result);

	});
}

function convertDateToUTC(date) { 
	return date;
	return new Date(
		date.getUTCFullYear(), 
		date.getUTCMonth(), 
		date.getUTCDate(), 
		date.getUTCHours(),
		date.getUTCMinutes(), 
		date.getUTCSeconds());
}

var setError = function(res, code, message){
	console.log(message);
	res.writeHead(code, message, {'content-type' : 'text/plain'});
    res.end(message);
}