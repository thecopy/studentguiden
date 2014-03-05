var parser = function(req, res, next){
	var body = "";

	req.on('data', function (chunk) {
    	body = body + chunk;
  	});

  	req.on('end', function(){
  		req.body = JSON.parse(body);
  		next();
  	});
};

module.exports = parser;