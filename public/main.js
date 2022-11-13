let numBalls = 0;
let spring = 0.1;
const gravity = 0;
let friction = -0.3;
let selected = -1;
let flag = 0;
let balls = [];
let points = [];
let cnv;
let pressed = false;
const socket = io();
let inpt;

class Particle{
  constructor(x,y,angle){
    this.x = x;
    this.y = y;
    let intensity =0.1;
    this.vx = intensity*16*pow(sin(angle),3);
    this.vy = -intensity*(13*cos(angle)-5*cos(2*angle)-2*cos(3*angle)-cos(4*angle));
    this.lifespan = 128;
  }
  move(){
    
    this.x+=this.vx;
    this.y+=this.vy;
    this.lifespan-=2;
  }
  display(){
    fill(255, 135, 171, map(this.lifespan, 0, 128, 0, 255));
    circle(this.x, this.y, 4);
  }
}

function heart(posX, posY, size, clr){
  fill(clr);
  beginShape();
  let r = size;
  for (let a = 0; a<TWO_PI;a+=0.01){
    let x = r*16*pow(sin(a),3)+posX;
    let y = -r*(13*cos(a)-5*cos(2*a)-2*cos(3*a)-cos(4*a))+ posY;
    vertex(x,y);
  }
  endShape();
}

function setup() {
  cnv = createCanvas(500, 500);
  inpt = select("#msgBox");
  //frameRate(30);
//   for (let i = 0; i < numBalls; i++) {
//     balls[i] = new Ball(
//       random(width),
//       random(height),
//       random(30, 50),
//       i,
//       balls
//     );
//   }
  noStroke();
  textSize(14);
  textAlign(CENTER);
  rectMode(CENTER);
  //noCursor();
}

function draw() {
  background(250,221,225);
  textSize(100);
  noStroke();
  fill("pink");
  text(numBalls,width*0.5,height*0.55);
  textSize(14);
  displayChart();
  flag = 0;
  balls.forEach(ball => {
    ball.collide();
    ball.move();
    ball.display();
  });
  //console.log(selected, flag);
  if(flag==0 && pressed && mouseX<=width&&mouseY<=height&&mouseX>0&&mouseY>0)selected=-1;
  //console.log(lastTouched);
  //fill("#ff5d8f");
  //stroke(255);
  //circle(mouseX,mouseY,10);
}
function mousePressed(){
  pressed = true;
}
function mouseReleased(){
  pressed = false;
}
function keyPressed(){
  if(keyCode == ENTER){
    addBall();
  }
}
function addBall(){
  let bx = inpt.elt;
  if(!bx.value)return;
  const sz = random(30,50);
  const x = random(width);
  const y = random(height);
  socket.emit("new ball", [x,y,sz, bx.value]);
  bx.value = "";
  
}

function removeBall(){
  if(!numBalls || selected<0)return;
  socket.emit('kill ball', selected);
}

function displayChart(){
  if(!points.length)return;
  let furthest = points[points.length-1][0];
  //console.log(furthest);
  let x = map(points[0][0],points[0][0],furthest,0,width-1);
  let y = height-map(points[0][1],0,50,0,height-1);
  for(let i=1;i<points.length;i++){
    
    
    
    let newX = map(points[i][0],points[0][0],furthest,0,width-1);
    let newY = height-map(points[i][1],0,50,0,height-1);
    let k = ((newX-x)>=0) ^ ((newY-y)>=0);
    if(k){
      stroke("white");
    }
    else stroke("red");
    line(newX,newY,x,y);
    x = newX;
    y = newY;
    
    
  }
  noStroke();
  fill("black");
  for(let i=0;i<points.length;i++){
    let x = map(points[i][0],points[0][0],furthest,0,width-1);
    let y = height-map(points[i][1],0,50,0,height-1);
    //circle(x,y,5);
    heart(x, y, 0.25, "black");
  }
  for(let i=0;i<points.length;i++){
    let x = map(points[i][0],points[0][0],furthest,0,width-1);
    let y = height-map(points[i][1],0,50,0,height-1);
    //circle(x,y,5);
    if(mouseX>x-5 && mouseX<x+5 && mouseY>y-5 && mouseY<y+5){
      let dt = new Date(points[i][0]);
      let dtStr = dt.toDateString().slice(4);
      let actualX = min(max(x, textWidth(dtStr)/2), width-1-textWidth(dtStr)/2);
      fill("white");
      stroke("black");
      rect(actualX,y-8,textWidth(dtStr)+5, 20, 25);
      fill("black");
      text(dtStr,actualX,y-5);
    }
  }
}
socket.on('load chart', (newPoints)=>{
  
  points=newPoints;
});
socket.on('load balls', (newBalls)=>{
  balls = [];
  newBalls.forEach(ball=>{
    balls.push(new Ball(...ball, numBalls++));
  });
});

socket.on('new ball', (ball)=>{
  balls.push(new Ball(...ball, numBalls++));
});
socket.on('kill ball', (idBall)=>{
  
  for(let i=0;i<numBalls;i++){
    if(i<=idBall)continue;
    balls[i].id--;
  }
  balls.splice(idBall,1);
  numBalls--;
});

class Ball {
  constructor(xin, yin, din, txt, idin) {
    this.particles = [];
    this.x = xin;
    this.y = yin;
    this.vx = 0;
    this.vy = 0;
    this.diameter =0.3* din;
    this.id = idin;
    //this.others = balls;
    this.txt = txt;
    this.spawn();
  }
  spawn(){
    for(let i=0;i<100;i++){
      let angle = random(0, 2*PI);
      this.particles.push(new Particle(this.x, this.y,angle));
    }
  }
  

  collide() {
    for (let i = 0; i < numBalls; i++) {
      if(i==this.id)continue;
      // console.log(others[i]);
      let dx = balls[i].x - this.x;
      let dy = balls[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = balls[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - balls[i].x) * spring;
        let ay = (targetY - balls[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        balls[i].vx += ax;
        balls[i].vy += ay;
      }
    }
  }

  move() {
    for(let i=this.particles.length-1;i>0;i--){
      let p = this.particles[i];
      p.move();
      if(p.lifespan < 0){
        this.particles.splice(i,1);
      }
    }
    let dist = (mouseX-this.x)*(mouseX-this.x)+(mouseY-this.y)*(mouseY-this.y);
    if(dist<=this.diameter*this.diameter && pressed){
      selected=this.id;
      flag = 1;
      this.x+=(mouseX-pmouseX);
      this.y+=(mouseY-pmouseY)
      //lastTouched = this.id;
      this.vx=(mouseX-pmouseX);
      this.vy=(mouseY-pmouseY);
      return;
    }
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      this.vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      this.vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= friction;
    }
  }

  display() {
    noStroke();
    for(let i=this.particles.length-1;i>0;i--){
      let p = this.particles[i];
      
      p.display();
    }
    let dist = (mouseX-this.x)*(mouseX-this.x)+(mouseY-this.y)*(mouseY-this.y);
    if(this.id==selected){
      stroke(0)
    }
    else noStroke();
    //fill("#ff87ab");
    heart(this.x, this.y, 2*this.diameter/30,"#ff87ab");
    if(dist<=this.diameter*this.diameter){
      stroke(0);
      fill(255);
      text(this.txt,this.x,this.y);
    }
    
    
  }
}
