var connect = require("connect");
var http = require("http");

var StudentGuiden = require("./StudentGuiden");
var bodyParser = require("./bodyParser");


var app = connect()
  .use(connect.logger('dev'))
  .use(bodyParser)
  .use(StudentGuiden);

http.createServer(app).listen(5000);