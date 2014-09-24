var repository = require("./repository");
var URL = require('url');
var jade = require('jade');
var moment = require('moment');
var fs = require('fs');

module.exports = function(req, res, next){

	// Oh, how i wish i used ExpressJS right now :)
	// Because this is kinda ugly 
	if(req.url == '/gui/'){
		render_main(req,res);
	}else if(req.url == '/gui/stats/'){
		render_stats(req,res);
	}else if(req.url.substr(0,17) == '/gui/setcategory/'){
		set_category(req,res);
	}else if(req.url.substr(0,8) == '/public/'){
		fs.readFile('./public/' + req.url.substr(8), function (err, data) {
	      if (err) {
	        next(err);
	        return;
	      }
	      res.end(data);
	  });
	}else{
		next();
	}
}

function set_category(req,res){
	var category = 
			req.url.substr(
				req.url.lastIndexOf('/') + 1);
		var id = req.url.substring(
				17,
				req.url.lastIndexOf('/'));

		console.log("Setting category to " + category + " for event " + id);

		repository.updateEventCategory(id, category, function(err,count){
			if(err){
				setError(res, 500, err);
			}
			console.log("Updated " + count + " events")
			render_main(req,res);
		});
}

function render_stats(req,res){
	var today = new Date();
	var twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(today.getDate() - 14);
	twoWeeksAgo.setHours(0,0,0,0);

	repository.getStats(twoWeeksAgo,today, function(err, result){
		if(err)
		{
			setError(res, 500, err);
			return;
		}

		res.end(jade.renderFile('views/stats.jade', { stats: result }));
		
	});
	
}

function render_main(req,res){
	var today = new Date();
	var nextWeek = new Date();
	nextWeek.setDate(today.getDate() + 7);

	var events = repository.getEvents(today,nextWeek, null, null, null, function(stream,db){

		if(!stream)
		{
			setError(res, 500, "Did not get stream object from repository!");
			return;
		}

		var result = [];

		stream.on('data', function(eventItem){
			if(!eventItem.categories || eventItem.categories.length == 0)
				result.push(eventItem);
		});

		stream.on('close', function() {
			db.close();
			res.end(jade.renderFile('views/index.jade', { events: result }));
		});

	});
}

var setError = function(res, code, message){
	console.log(message);
	res.writeHead(code, message, {'content-type' : 'text/plain'});
    res.end(message);
}