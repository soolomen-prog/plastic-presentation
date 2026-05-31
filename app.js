const BALL_TON = 13;

const BALL_SIZE = 50;
const BALL_RADIUS = BALL_SIZE / 2;

const BALL_SPAWN_INTERVAL = 1000;

let currentSlide = 0;
let totalTon = 0;

/* slides */

const slides = document.querySelectorAll(".slide");

function showSlide(index){

  currentSlide = Math.max(
    0,
    Math.min(index,slides.length-1)
  );

  slides.forEach((slide,i)=>{

    slide.classList.toggle(
      "active",
      i===currentSlide
    );

  });

}

document.addEventListener("keydown",(e)=>{

  if(e.key==="ArrowRight"){
    showSlide(currentSlide+1);
  }

  if(e.key==="ArrowLeft"){
    showSlide(currentSlide-1);
  }

});

/* timer */

const timerEl =
document.getElementById("timer");

const startTime = Date.now();

function updateTimer(){

  const t =
  Math.floor(
    (Date.now()-startTime)/1000
  );

  const h =
  String(
    Math.floor(t/3600)
  ).padStart(2,"0");

  const m =
  String(
    Math.floor((t%3600)/60)
  ).padStart(2,"0");

  const s =
  String(
    t%60
  ).padStart(2,"0");

  timerEl.textContent =
  `${h}:${m}:${s}`;

}

updateTimer();
setInterval(updateTimer,1000);

/* big counter */

const bigCounter =
document.getElementById(
  "bigTonCounter"
);

function updateCounters(){

  if(!bigCounter) return;

  bigCounter.textContent =
  totalTon.toString();

}

/* physics */

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  World
} = Matter;

const engine = Engine.create();

const canvas =
document.getElementById(
  "physics"
);

const render = Render.create({

  canvas,

  engine,

  options:{
    width:window.innerWidth/2,
    height:window.innerHeight,
    wireframes:false,
    background:"transparent"
  }

});

Render.run(render);

const runner = Runner.create();
Runner.run(runner,engine);

/* walls */

let floor;
let wallLeft;
let wallRight;

function createWalls(){

  const halfWidth =
  window.innerWidth/2;

  const height =
  window.innerHeight;

  floor = Bodies.rectangle(
    halfWidth/2,
    height+50,
    halfWidth,
    100,
    {isStatic:true}
  );

  wallLeft = Bodies.rectangle(
    -50,
    height/2,
    100,
    height*2,
    {isStatic:true}
  );

  wallRight = Bodies.rectangle(
    halfWidth+50,
    height/2,
    100,
    height*2,
    {isStatic:true}
  );

  World.add(
    engine.world,
    [floor,wallLeft,wallRight]
  );

}

createWalls();

/* balls */

function spawnBall(){

  const halfWidth =
  window.innerWidth/2;

  const ball =
  Bodies.circle(

    Math.random()*
    (halfWidth-BALL_RADIUS*2)+
    BALL_RADIUS,

    -BALL_RADIUS,

    BALL_RADIUS,

    {
      restitution:0.4,
      friction:0.3,
      render:{
        fillStyle:"#D5FB11"
      }
    }

  );

  Composite.add(
    engine.world,
    ball
  );

  totalTon += BALL_TON;

  updateCounters();

}

setInterval(
  spawnBall,
  BALL_SPAWN_INTERVAL
);

window.addEventListener("resize", () => {

  render.canvas.width = window.innerWidth / 2;
  render.canvas.height = window.innerHeight;

  render.options.width = window.innerWidth / 2;
  render.options.height = window.innerHeight;

});

updateCounters();

showSlide(0);
