const express = require('express');
const app = express();
const http = require('http');
const fs=require('fs');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
let port = 80;
const myArgs = process.argv.slice(2);

let balls = [];
let points = [[Date.now(),0]];

const cfg = fs.readFile("config.json", "utf-8", (err, jsonString)=>{
  if(err){
    console.log("Failed to open json file you dumbass",err);
    return;
  }
  //console.log(jsonString);
  let data = JSON.parse(jsonString);
  if(data.pts.length){
    points = data.pts;
  }
  else data.pts=points;
  balls=data.blls;
});




let hostname = '104.248.227.135';
if(myArgs[0]=="-l"){
  hostname='127.0.0.1';
  port = 3000;
}
app.use(express.static('public'));
io.on('connection', (socket)=>{
  console.log(`New user connected. ID:${socket.id}`);
  balls.forEach((ball)=>{
    socket.emit('new ball', ball);
  });
  socket.emit('load chart',points)
  socket.on('new ball', (ball)=>{
    console.log(`New heart added by ${socket.id}. Text:${ball[3]}.`);
    balls.push(ball);
    points.push([Date.now(),balls.length]);
    fs.writeFile('config.json',JSON.stringify({blls:balls,pts:points}), err =>{
      if(err)console.log("eror writing :(");
    });
    io.emit('load chart', points);
    io.emit('new ball', ball);
  });
  socket.on('kill ball', ()=>{
    balls.shift();
    points.push([Date.now(),balls.length]);
    fs.writeFile('config.json',JSON.stringify({blls:balls,pts:points}), err =>{
      if(err)console.log("eror writing :(");
    });
    io.emit('load chart', points);
    io.emit('kill ball');
  });
});
// app.get('/',(req,res)=>{
//   res.sendFi
// });

server.listen(port, hostname);
console.log(`Server is running at http://${hostname}:${port}`);
