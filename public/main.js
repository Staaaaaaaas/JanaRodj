
let numBalls = 0;
let spring = 0.05;
let gravity = 0.03;
let friction = -0.9;
let balls = [];
var socket = io();
function setup() {
  createCanvas(500, 500);
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
  //noCursor();
}

function draw() {
  background(250,221,225);
  balls.forEach(ball => {
    ball.collide();
    ball.move();
    ball.display();
  });
  //fill("#ff5d8f");
  //stroke(255);
  //circle(mouseX,mouseY,10);
}
function addBall(){
  const sz = random(30,50);
  const x = random(width);
  const y = random(height);
  socket.emit("new ball", [x,y,sz]);
}
socket.on('draw ball', (ball)=>{
  balls.push(new Ball(...ball, numBalls++, balls));
});
// function mousePressed(){
// 	balls.push(new Ball(
// 		mouseX,
// 		mouseY,
// 		random(30,70),
// 		numBalls++,
// 		balls
// 	));
// }

class Ball {
  constructor(xin, yin, din, idin, oin) {
    this.x = xin;
    this.y = yin;
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
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
	fill("#ff87ab");
	circle(this.x-this.diameter/2.5,this.y,this.diameter);
	circle(this.x+this.diameter/2.5,this.y,this.diameter);
	triangle(this.x-this.diameter*0.87,this.y+0.2*this.diameter,this.x+this.diameter*0.87,this.y+0.2*this.diameter,this.x,this.y+1.2*this.diameter);
    //ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}