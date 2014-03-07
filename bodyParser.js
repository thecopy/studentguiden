var dateTimeReviver = function (key, value) {
    if (typeof value === 'string' && key == 'date') {
        return new Date(value);
    }
    return value;
}

var parser = function(req, res, next){
	var body = null;

	req.on('data', function (chunk) {
		if(body == null)
			body = "";

    	body = body + chunk;
  	});

  	req.on('end', function(){
  		if(body != null)
  			req.body = JSON.parse(body, dateTimeReviver);

  		next();
  	});
};

module.exports = parser;