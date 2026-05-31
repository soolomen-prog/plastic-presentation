const BALL_TON = 13;
const WAGON_TON = 60;
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

  const physicsLayer =
  document.getElementById("physics-layer");

  if(currentSlide === 4 || currentSlide === 5){
    timerEl.style.display = "none";
  }else{
    timerEl.style.display = "block";
  }

  if(currentSlide >= 0 && currentSlide <= 2){
    physicsLayer.style.display = "block";
  }else{
    physicsLayer.style.display = "none";
  }

  updateFateChart();
  updateQuizHighlights();

}

/* navigation */

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

const bigCounters =
document.querySelectorAll(
  "#bigTonCounter, #bigTonCounter4"
);

const wagonCounter =
document.getElementById(
  "wagonCounter"
);

const train =
document.getElementById(
  "train"
);

const railroad =
document.getElementById(
  "railroad"
);

function updateCounters(){

bigCounters.forEach(counter=>{

  counter.textContent =
  totalTon.toString();

});

  if(wagonCounter){

    wagonCounter.textContent =
    Math.floor(
      totalTon / WAGON_TON
    );

  }

  updateTrain();
  updateFateChart();

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
  halfWidth + 50,
  height / 2,
  100,
  height * 2,
  {
    isStatic:true,
    render:{ visible:false }
  }
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


});

Render.setPixelRatio(render, window.devicePixelRatio);

/* railroad */

if(railroad){

  for(let i=0;i<24;i++){

    const segment =
    document.createElement("div");

    segment.className =
    "rail-segment";

    segment.innerHTML =
    `<img src="./assets/svg/railroad.svg">`;

    railroad.appendChild(segment);

  }

}

/* train */

function updateTrain(){

  if(!train) return;

  /*
    Slide 4 now uses one long SVG strip instead of adding
    a separate wagon for every 60 tons.
    Replace ./assets/svg/wagen.svg with the final 3456x274 file.
  */

  if(!train.querySelector(".wagon-strip")){

    train.innerHTML =
    `<div class="wagon-strip">
      <img src="./assets/svg/wagen.svg" alt="">
    </div>`;

  }

}

/* fate chart */

const FATE_CHART_MAX_TON = 10000;

const fateData = {
  landfill:0.50,
  nature:0.22,
  burned:0.19,
  recycled:0.09
};

function formatTon(value){

  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g," ");

}

function updateFateChart(){

  const fateChart =
  document.getElementById("fateChart");

  if(!fateChart) return;

  Object.entries(fateData).forEach(([key,share])=>{

    const segment =
    fateChart.querySelector(`.fate-${key === "landfill" ? "landfill" : key}`);

    const tonEl =
    fateChart.querySelector(`[data-fate="${key}"]`);

    if(!segment || !tonEl) return;

    const value = totalTon * share;

    const fillPercent = Math.min(
      (value / FATE_CHART_MAX_TON) * 100,
      100
    );

    const fill =
    segment.querySelector(".fate-fill");

    fill.style.height = `${fillPercent}%`;

    tonEl.textContent = formatTon(value);
    tonEl.style.bottom = `calc(${fillPercent}% + 24px)`;

  });

}


/* quiz highlights */

let slide5HighlightTimeout = null;
let slide6HighlightTimeout = null;
let lastQuizAnswerIndex = -1;

function clearQuizHighlights(){

  if(slide5HighlightTimeout){
    clearTimeout(slide5HighlightTimeout);
    slide5HighlightTimeout = null;
  }

  if(slide6HighlightTimeout){
    clearTimeout(slide6HighlightTimeout);
    slide6HighlightTimeout = null;
  }

  const slide5Highlight =
  document.getElementById("slide5Highlight");

  if(slide5Highlight){
    slide5Highlight.classList.remove("is-highlighted");
  }

  document
    .querySelectorAll(".quiz-answer-highlight")
    .forEach(item=>{
      item.classList.remove("is-highlighted");
    });

}

function startSlide5Highlight(){

  const slide5Highlight =
  document.getElementById("slide5Highlight");

  if(!slide5Highlight) return;

  slide5HighlightTimeout = setTimeout(()=>{
    slide5Highlight.classList.add("is-highlighted");
  },2000);

}

function pickQuizAnswerIndex(count){

  if(count <= 1) return 0;

  let index = Math.floor(Math.random() * count);

  while(index === lastQuizAnswerIndex){
    index = Math.floor(Math.random() * count);
  }

  lastQuizAnswerIndex = index;
  return index;

}

function runSlide6HighlightLoop(){

  const answers =
  Array.from(
    document.querySelectorAll(".quiz-answer-highlight")
  );

  if(currentSlide !== 5 || answers.length === 0) return;

  answers.forEach(item=>{
    item.classList.remove("is-highlighted");
  });

  const index = pickQuizAnswerIndex(answers.length);
  const item = answers[index];

  /* restart CSS animation */
  void item.offsetWidth;
  item.classList.add("is-highlighted");

  slide6HighlightTimeout = setTimeout(
    runSlide6HighlightLoop,
    2600
  );

}

function startSlide6Highlights(){

  lastQuizAnswerIndex = -1;

  slide6HighlightTimeout = setTimeout(
    runSlide6HighlightLoop,
    500
  );

}

function updateQuizHighlights(){

  clearQuizHighlights();

  if(currentSlide === 4){
    startSlide5Highlight();
  }

  if(currentSlide === 5){
    startSlide6Highlights();
  }

}

setInterval(updateFateChart,250);
updateCounters();
showSlide(0);
