var config = require('./config');

module.exports = function(req, res, next){
	var headerName = 'app-key';

	if(!req.headers[headerName]){
		console.log('No header "' + headerName + '"');
				setError(res, 401, 'Unauthorized');
		return;
	}

	if(req.headers[headerName] == config.appkey){
		next();
	}else{
		console.log("Wrong key: " + req.headers[headerName])
		setError(res, 401, 'Unauthorized');
	}
};


var setError = function(res, code, message){
	console.log(message);
	res.writeHead(code, message, {'content-type' : 'text/plain'});
    res.end(message);
}