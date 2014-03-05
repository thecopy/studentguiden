var repository = require("./repository");

module.exports = function(req, res){

	switch(req.url){
		case '/api/events':
			{
				if(req.method == 'GET')
					get_events(req,res);
				else if(req.method == 'POST')
					post_events(req,res);
			}
			break;
		default:
			setError(res, 400, "Invalid request for api parser: " + req.url);
		break;
	}
}


function post_events(req,res){
	events = req.body.events;
	console.dir(events);
	repository.addEvents(events, function(err, result){
		console.log("Added " + result.length + " events. Error: " + err);
		res.end("ok:" + result.length);
	});
}

function get_events(req,res){
	var from = new Date(req.body.from);
	var to = new Date(req.body.to);
	var nation = req.body.nation;

	if(from == null || to == null){
		setError(res, 400, "from and to parameters cannot be null!");
		return;
	}

	var stream = repository.getEvents(from, to, nation, function(stream){

		if(!stream)
		{
			setError(res, 500, "Did not get stream object from repository!");
			return;
		}

		var result = [];

		stream.on('data', function(eventItem){
			result.push(eventItem);
		});

		stream.on('error', function(err) {  
			 setError(res, 500, err);
		});

		stream.on('close', function() {
			res.end(JSON.stringify(result)); 
		});
	});
}

var setError = function(res, code, message){
	console.log(message);
	res.writeHead( code, message, {'content-type' : 'text/plain'});
    res.end(message);
}