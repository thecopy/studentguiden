var connect = require("connect");
var http = require("http");
var gzip = require("connect-gzip");

var auth = require("./auth");
var StudentGuiden = require("./StudentGuiden");
var bodyParser = require("./bodyParser");


var app = connect()
  .use(connect.logger('dev'))
  .use(gzip)
  .use(auth)
  .use(bodyParser)
  .use(StudentGuiden);

http.createServer(app).listen(5000);