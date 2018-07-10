const http = require('http');
var schedule = require('node-schedule');

const hostname = '127.0.0.1';
const port = 3000;
var date = new Date(2016, 8, 13, 19, 55, 0);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log("Server running at http:/"+hostname+":"+port+"/");
});

var j = schedule.scheduleJob(date, function(){
  console.log('The world is going to end today.');
});
