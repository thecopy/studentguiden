var dateTimeReviver = function (key, value) {
    if (typeof value === 'string' && key == 'date') {
        return new Date(value);
    }
    return value;
}

var parser = function(req, res, next){
  var body = null;

  req.on('data', function (chunk) {
    if(body == null){
      body = "";
    }

    body = body + chunk;
  });

  req.on('end', function(){
    if(body != null){
      try{
        req.body = JSON.parse(body, dateTimeReviver);
        next();
      }catch(e){
        setError(res, 403, 'Bad Request, illformated JSON',e,body);
      }
    }else{
        next();
    }
  });
};

module.exports = parser;

var setError = function(res, code, message,e,extra){
  console.log(message);
  res.writeHead(code, message, {'content-type' : 'text/plain'});
  res.write("Exception:\n");
  res.write(e.toString());
  res.write("\n\nJson:\n");
  res.write(extra)
  res.end(message);
}