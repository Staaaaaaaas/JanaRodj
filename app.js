const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3000;
const myArgs = process.argv.slice(2);


let balls = [];
let points = [[Date.now(),0]];


let hostname = '104.248.227.135';
if(myArgs[0]=="-l")hostname='127.0.0.1';
app.use(express.static('public'));
io.on('connection', (socket)=>{
  balls.forEach((ball)=>{
    socket.emit('new ball', ball);
  });
  socket.emit('load chart',points)
  socket.on('new ball', (ball)=>{
    balls.push(ball);
    points.push([Date.now(),balls.length]);
    socket.emit('load chart', points);
    io.emit('new ball', ball);
  });
  socket.on('kill ball', ()=>{
    balls.shift();
    points.push([Date.now(),balls.length]);
    socket.emit('load chart', points);
    io.emit('kill ball');
  });
});
// app.get('/',(req,res)=>{
//   res.sendFi
// });

server.listen(port, hostname);
console.log(`Server is running at http://${hostname}:${port}`);