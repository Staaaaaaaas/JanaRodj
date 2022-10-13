let numBalls = 0;
let spring = 0.05;
let gravity = 0.03;
let friction = -0.9;
let balls = [];
let points = [];
let cnv;
let pressed = false;
const socket = io("http://bfstocks.xyz", {reconnect:false, autoConnect:false});
let inpt;


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
  balls.forEach(ball => {
    ball.collide();
    ball.move();
    ball.display();
  });
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
  if(!numBalls)return;
  socket.emit('kill ball');
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
    circle(x,y,5);
  }
}
socket.on('load chart', (newPoints)=>{
  
  points=newPoints;
});
socket.on('new ball', (ball)=>{
  balls.push(new Ball(...ball, numBalls++, balls));
});
socket.on('kill ball', ()=>{
  balls.shift();
  numBalls--;
});

class Ball {
  constructor(xin, yin, din, txt, idin, oin) {
    this.x = xin;
    this.y = yin;
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
    this.txt = txt;
  }

  collide() {
    for (let i = 0; i < numBalls; i++) {
		if(i==this.id)continue;
      // console.log(others[i]);
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - this.others[i].x) * spring;
        let ay = (targetY - this.others[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        this.others[i].vx += ax;
        this.others[i].vy += ay;
      }
    }
  }

  move() {
    let dist = (mouseX-this.x)*(mouseX-this.x)+(mouseY-this.y)*(mouseY-this.y);
    if(dist<=this.diameter*this.diameter && pressed){
      this.vy = 0;
      this.vx = 0;
      this.x = mouseX;
      this.y = mouseY;
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
    let dist = (mouseX-this.x)*(mouseX-this.x)+(mouseY-this.y)*(mouseY-this.y);
    if(dist<=this.diameter*this.diameter)fill(255, (Date.now())%256, 171 );
    else fill("#ff87ab");
    noStroke();
    circle(this.x-this.diameter/2.5,this.y,this.diameter);
    circle(this.x+this.diameter/2.5,this.y,this.diameter);
    triangle(this.x-this.diameter*0.87,this.y+0.2*this.diameter,this.x+this.diameter*0.87,this.y+0.2*this.diameter,this.x,this.y+1.2*this.diameter);
      //ellipse(this.x, this.y, this.diameter, this.diameter);
    if(dist<=this.diameter*this.diameter){
      stroke(0);
      fill(255);
      text(this.txt,this.x,this.y);
    }
    
    
  }
}