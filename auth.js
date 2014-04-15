var config = require('./config');

module.exports = function(req, res, next){
	if(config.disableAuthIfDevMode === true){
		if(config.isInDevMode === true){
			next();
			return;
		}
	}

	var headerName = 'app-key';

	if(req.headers[headerName] && req.headers[headerName] == config.appkey){
		next();
	}else{	
		console.log('Auth failed for ' + req.connection.remoteAddress + ': header["' + headerName + '"]=' + req.headers[headerName]);
		setError(res, 401, 'Unauthorized');
	}
};


var setError = function(res, code, message){
	console.log(message);
	res.writeHead(code, message, {'content-type' : 'text/plain'});
    res.end(message);
}