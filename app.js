var connect = require("connect");
var http = require("http");
var gzip = require("connect-gzip");

var auth = require("./auth");
var StudentGuiden = require("./StudentGuiden");
var StudentGuidenGui = require("./StudentGuidenGui");
var bodyParser = require("./bodyParser");
var stats = require("./stats");

var app = connect()
  .use(connect.logger('dev'))
  .use(gzip)
  .use(StudentGuidenGui)
  .use(auth)
  .use(stats)
  .use(bodyParser)
  .use(StudentGuiden);

http.createServer(app).listen(5000);

console.log("Started Studentguiden Back-End Service");
console.log("Config:")
console.dir(require("./config"));