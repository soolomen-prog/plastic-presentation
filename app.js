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

  if([4,5,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,25,26,27,28,29,30,32,33].includes(currentSlide)){
    timerEl.style.display = "none";
  }else{
    timerEl.style.display = "block";
  }

  if((currentSlide >= 0 && currentSlide <= 2) || currentSlide === 12 || currentSlide === 24 || currentSlide === 31){
    physicsLayer.style.display = "block";
  }else{
    physicsLayer.style.display = "none";
  }

  updateFateChart();
  updateQuizHighlights();
  updateGrowthSlide();
  updateOceanSlide();

  if(currentSlide === 8){
    initOceanDots();
  }

  if(currentSlide === 14 || currentSlide === 33){
    startMicroSnow();
  }else{
    stopMicroSnow();
  }

}

/* navigation */

document.addEventListener("keydown",(e)=>{

  console.log(e.key);

  if(
    e.key==="ArrowRight" ||
    e.key==="PageDown" ||
    e.key===" " ||
    e.key==="Enter" ||
    e.key==="Right" ||
    e.key==="Down"
  ){
    showSlide(currentSlide+1);
  }

  if(
    e.key==="ArrowLeft" ||
    e.key==="PageUp" ||
    e.key==="Left" ||
    e.key==="Up"
  ){
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
  "#bigTonCounter, #bigTonCounter4, #bigTonCounter32, #microTonCounter, #microTonCounter25"
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

  if(counter.id === "microTonCounter" || counter.id === "microTonCounter25"){

    counter.textContent =
    formatTon(totalTon) + " tonnen";

  }else{

    counter.textContent =
    totalTon.toString();

  }

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
  World,
  Body
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

let lastPhysicsWidth = window.innerWidth / 2;
let lastPhysicsHeight = window.innerHeight;

function createWalls(){

  [floor, wallLeft, wallRight].forEach(wall=>{

    if(wall){
      Composite.remove(engine.world, wall);
    }

  });

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

const plasticBalls = [];
let burnCycleActive = false;
const BURN_CYCLE_INTERVAL = 120000;
const BURN_COLOR = "#719893";

function easeInQuad(progress){

  return progress * progress;

}

function burnHalfBalls(){

  if(burnCycleActive || plasticBalls.length < 2) return;

  burnCycleActive = true;

  const burnCount = Math.floor(plasticBalls.length / 2);

  const candidates = plasticBalls
    .slice()
    .sort((a,b)=>{
      const bottomToTop = b.position.y - a.position.y;
      const jitter = (Math.random() - 0.5) * 120;
      return bottomToTop + jitter;
    })
    .slice(0,burnCount);

  const colorDuration = 2600;
  const removeDuration = 2600;
  const removeStartDelay = colorDuration + 450;

  candidates.forEach((ball,index)=>{

    const progress = burnCount <= 1 ? 1 : index / (burnCount - 1);
    const delay = easeInQuad(progress) * colorDuration;

    setTimeout(()=>{
      ball.render.fillStyle = BURN_COLOR;
    },delay);

    setTimeout(()=>{

      Composite.remove(engine.world,ball);

      const ballIndex = plasticBalls.indexOf(ball);
      if(ballIndex !== -1){
        plasticBalls.splice(ballIndex,1);
      }

    },removeStartDelay + easeInQuad(progress) * removeDuration);

  });

  setTimeout(()=>{
    burnCycleActive = false;
  },removeStartDelay + removeDuration + 500);

}

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

  plasticBalls.push(ball);

  totalTon += BALL_TON;

  updateCounters();

}

setInterval(
  spawnBall,
  BALL_SPAWN_INTERVAL
);

setInterval(
  burnHalfBalls,
  BURN_CYCLE_INTERVAL
);

function resizeMainPhysics(){

  const newWidth = window.innerWidth / 2;
  const newHeight = window.innerHeight;

  const scaleX = newWidth / lastPhysicsWidth;
  const scaleY = newHeight / lastPhysicsHeight;

  render.options.width = newWidth;
  render.options.height = newHeight;

  render.canvas.width = newWidth * window.devicePixelRatio;
  render.canvas.height = newHeight * window.devicePixelRatio;

  render.canvas.style.width = `${newWidth}px`;
  render.canvas.style.height = `${newHeight}px`;

  render.bounds.max.x = newWidth;
  render.bounds.max.y = newHeight;

  plasticBalls.forEach(ball=>{

    Body.setPosition(ball,{
      x:Math.min(
        Math.max(ball.position.x * scaleX, BALL_RADIUS),
        newWidth - BALL_RADIUS
      ),
      y:Math.min(
        Math.max(ball.position.y * scaleY, -BALL_RADIUS),
        newHeight - BALL_RADIUS
      )
    });

    Body.setVelocity(ball,{
      x:ball.velocity.x * scaleX,
      y:ball.velocity.y * scaleY
    });

  });

  lastPhysicsWidth = newWidth;
  lastPhysicsHeight = newHeight;

  createWalls();
  createOceanWalls();
  createMicroSnowWalls();

  Render.setPixelRatio(render, window.devicePixelRatio);

}

window.addEventListener("resize", resizeMainPhysics);
document.addEventListener("fullscreenchange", resizeMainPhysics);

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

let quizQuestionHighlightTimeout = null;
let quizAnswerHighlightTimeout = null;
let lastQuizAnswerIndex = -1;

function clearQuizHighlights(){

  if(quizQuestionHighlightTimeout){
    clearTimeout(quizQuestionHighlightTimeout);
    quizQuestionHighlightTimeout = null;
  }

  if(quizAnswerHighlightTimeout){
    clearTimeout(quizAnswerHighlightTimeout);
    quizAnswerHighlightTimeout = null;
  }

  document
    .querySelectorAll(
      ".quiz-word-highlight, .quiz-answer-highlight, .source-highlight"
    )
    .forEach(item=>{
      item.classList.remove("is-highlighted");
    });

}

function getActiveSlide(){

  return slides[currentSlide];

}

function startQuizQuestionHighlight(){

  const activeSlide = getActiveSlide();

  if(!activeSlide) return;

  const highlight =
  activeSlide.querySelector(".quiz-word-highlight");

  if(!highlight) return;

  quizQuestionHighlightTimeout = setTimeout(()=>{
    highlight.classList.add("is-highlighted");
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

let sequentialHighlightIndex = -1;

function runQuizAnswerHighlightLoop(){

  const activeSlide = getActiveSlide();

  if(!activeSlide) return;

  const sequentialList =
  activeSlide.querySelector('[data-highlight-mode="sequential"]');

  const sequentialKeepList =
  activeSlide.querySelector('[data-highlight-mode="sequential-keep"]');

  const randomMultipleList =
  activeSlide.querySelector('[data-highlight-mode="random-multiple"]');

  const selector =
  (sequentialList || sequentialKeepList || randomMultipleList)
    ? ".source-highlight"
    : ".quiz-answer-highlight";

  const answers =
  Array.from(
    activeSlide.querySelectorAll(selector)
  );

  if(answers.length === 0) return;

  if(!sequentialKeepList){
    answers.forEach(item=>{
      item.classList.remove("is-highlighted");
    });
  }

  if(randomMultipleList){

    const shuffled = answers
      .slice()
      .sort(()=>Math.random() - 0.5);

    const highlightCount =
    Math.min(
      answers.length,
      2 + Math.floor(Math.random() * 2)
    );

    shuffled
      .slice(0,highlightCount)
      .forEach(item=>{
        void item.offsetWidth;
        item.classList.add("is-highlighted");
      });

    quizAnswerHighlightTimeout = setTimeout(
      runQuizAnswerHighlightLoop,
      1750
    );

    return;

  }

  const index = (sequentialList || sequentialKeepList)
    ? (sequentialHighlightIndex + 1) % answers.length
    : pickQuizAnswerIndex(answers.length);

  if(sequentialList || sequentialKeepList){
    sequentialHighlightIndex = index;
  }

  const item = answers[index];

  /* restart CSS animation */
  void item.offsetWidth;
  item.classList.add("is-highlighted");

  quizAnswerHighlightTimeout = setTimeout(
    runQuizAnswerHighlightLoop,
    sequentialKeepList ? 850 : 2600
  );

}

function startQuizAnswerHighlights(){

  lastQuizAnswerIndex = -1;
  sequentialHighlightIndex = -1;

  quizAnswerHighlightTimeout = setTimeout(
    runQuizAnswerHighlightLoop,
    500
  );

}

function updateQuizHighlights(){

  clearQuizHighlights();

  const activeSlide = getActiveSlide();

  if(!activeSlide) return;

  if(activeSlide.querySelector(".quiz-word-highlight")){
    startQuizQuestionHighlight();
  }

  if(activeSlide.querySelector(".quiz-answer-highlight, .source-highlight")){
    startQuizAnswerHighlights();
  }

}

/* growth slide */

const GROWTH_DURATION = 7200;

const growthData = {
  yearStart:2026,
  yearEnd:2050,
  landfillStart:4.9,
  landfillEnd:10,
  natureStart:1.25,
  natureEnd:2.5,
  oceanStart:130,
  oceanEnd:900
};

let growthProgress = 0;
let growthAnimationFrame = null;
let growthAnimationStartedAt = null;

function lerp(start,end,progress){

  return start + (end - start) * progress;

}

function easeInOutCubic(progress){

  if(progress < 0.5){
    return 4 * progress * progress * progress;
  }

  return 1 - Math.pow(-2 * progress + 2,3) / 2;

}

function formatGrowthDecimal(value){

  return Number(value.toFixed(1))
    .toString();

}

function updateGrowthSlide(){

  const growthSlide =
  document.getElementById("growthSlide");

  if(!growthSlide) return;

  const progress = growthProgress;
  const eased = easeInOutCubic(progress);

  const year =
  Math.round(
    lerp(
      growthData.yearStart,
      growthData.yearEnd,
      progress
    )
  );

  const landfill =
  lerp(
    growthData.landfillStart,
    growthData.landfillEnd,
    eased
  );

  const nature =
  lerp(
    growthData.natureStart,
    growthData.natureEnd,
    eased
  );

  const ocean =
  lerp(
    growthData.oceanStart,
    growthData.oceanEnd,
    eased
  );

  const yearEl =
  document.getElementById("growthYear");

  const landfillEl =
  document.getElementById("growthLandfillValue");

  const natureEl =
  document.getElementById("growthNatureValue");

  const oceanEl =
  document.getElementById("growthOceanValue");

  if(yearEl) yearEl.textContent = year;
  if(landfillEl) landfillEl.textContent = formatGrowthDecimal(landfill);
  if(natureEl) natureEl.textContent = formatGrowthDecimal(nature);
  if(oceanEl) oceanEl.textContent = Math.round(ocean);

  const landfillBar =
  document.querySelector('[data-growth-bar="landfill"]');

  const natureBar =
  document.querySelector('[data-growth-bar="nature"]');

  const oceanBar =
  document.querySelector('[data-growth-bar="ocean"]');

  if(landfillBar){
    landfillBar.style.height =
    `${lerp(48,100,eased)}px`;
  }

  if(natureBar){
    natureBar.style.height =
    `${lerp(28,56,eased)}px`;
  }

  if(oceanBar){
    oceanBar.style.height =
    `${lerp(20,180,eased)}px`;
  }

  const oceanItem =
  document.querySelector(".growth-ocean");

  if(oceanItem){
    oceanItem.classList.toggle(
      "is-finished",
      progress >= 1
    );
  }

}

function animateGrowth(timestamp){

  if(growthAnimationStartedAt === null){
    growthAnimationStartedAt = timestamp;
  }

  const rawProgress =
  (timestamp - growthAnimationStartedAt) / GROWTH_DURATION;

  growthProgress = Math.min(rawProgress,1);

  updateGrowthSlide();

  if(growthProgress < 1){
    growthAnimationFrame =
    requestAnimationFrame(animateGrowth);
  }else{
    growthAnimationFrame = null;
    growthAnimationStartedAt = null;
  }

}

function startGrowthAnimation(){

  if(growthAnimationFrame){
    cancelAnimationFrame(growthAnimationFrame);
  }

  growthProgress = 0;
  growthAnimationStartedAt = null;
  updateGrowthSlide();

  growthAnimationFrame =
  requestAnimationFrame(animateGrowth);

}

function resetGrowthAnimation(){

  if(growthAnimationFrame){
    cancelAnimationFrame(growthAnimationFrame);
    growthAnimationFrame = null;
  }

  growthAnimationStartedAt = null;
  growthProgress = 0;

  updateGrowthSlide();

}

function toggleGrowthAnimation(){

  if(growthProgress > 0 || growthAnimationFrame){
    resetGrowthAnimation();
  }else{
    startGrowthAnimation();
  }

}


/* ocean slide */

const OCEAN_DURATION = 7200;
const OCEAN_DOT_COUNT = 70;
const OCEAN_FISH_MIO = 1500;
const OCEAN_DOT_RADIUS = 32;
const OCEAN_TOP_SAFE_AREA = 150;

const oceanData = {
  yearStart:2026,
  yearEnd:2050,
  plasticStart:130,
  plasticEnd:900
};

let oceanProgress = 0;
let oceanAnimationFrame = null;
let oceanAnimationStartedAt = null;
let oceanDots = [];
let oceanDotsStarted = false;
let oceanDotsFrame = null;
let oceanLastTimestamp = null;
let oceanWalls = [];

const oceanEngine = Engine.create();
oceanEngine.gravity.x = 0;
oceanEngine.gravity.y = 0;

const oceanRunner = Runner.create();

function createOceanWalls(){

  if(oceanWalls.length){
    World.remove(oceanEngine.world,oceanWalls);
    oceanWalls = [];
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const wallSize = 120;

  oceanWalls = [
    Bodies.rectangle(width / 2,-wallSize / 2, width, wallSize,{isStatic:true}),
    Bodies.rectangle(width / 2,height + wallSize / 2, width, wallSize,{isStatic:true}),
    Bodies.rectangle(-wallSize / 2,height / 2, wallSize, height * 2,{isStatic:true}),
    Bodies.rectangle(width + wallSize / 2,height / 2, wallSize, height * 2,{isStatic:true})
  ];

  World.add(oceanEngine.world,oceanWalls);

}

function getOceanStartPosition(existingBodies){

  const width = window.innerWidth;
  const height = window.innerHeight;
  const minX = OCEAN_DOT_RADIUS;
  const maxX = width - OCEAN_DOT_RADIUS;
  const minY = OCEAN_TOP_SAFE_AREA;
  const maxY = height - OCEAN_DOT_RADIUS;
  const minDistance = OCEAN_DOT_RADIUS * 2 + 6;

  for(let attempt=0;attempt<500;attempt++){

    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    const hasOverlap =
    existingBodies.some(body=>{
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });

    if(!hasOverlap){
      return {x,y};
    }

  }

  return {
    x:minX + Math.random() * (maxX - minX),
    y:minY + Math.random() * (maxY - minY)
  };

}

function initOceanDots(){

  const container = document.getElementById("oceanDots");

  if(!container) return;

  if(oceanDots.length){
    updateOceanSlide();
    startOceanDots();
    return;
  }

  createOceanWalls();

  for(let i=0;i<OCEAN_DOT_COUNT;i++){

    const dot = document.createElement("div");
    dot.className = "ocean-dot";

    container.appendChild(dot);

    const position =
    getOceanStartPosition(
      oceanDots.map(item=>item.body)
    );

    const body =
    Bodies.circle(
      position.x,
      position.y,
      OCEAN_DOT_RADIUS,
      {
        restitution:0.03,
        friction:0.8,
        frictionAir:0.001,
        density:0.001,
        render:{
          visible:false
        }
      }
    );

    Body.setVelocity(body,{
      x:(Math.random() - 0.5) * 0.9,
      y:(Math.random() - 0.5) * 0.7
    });

    World.add(oceanEngine.world,body);

    oceanDots.push({
      el:dot,
      body,
      phase:Math.random() * Math.PI * 2
    });

  }

  updateOceanSlide();
  startOceanDots();

}

function startOceanDots(){

  if(oceanDotsStarted) return;

  oceanDotsStarted = true;

  Runner.run(oceanRunner,oceanEngine);
  oceanDotsFrame = requestAnimationFrame(animateOceanDots);

}

function applyOceanWaterMotion(timestamp){

  const width = window.innerWidth;
  const height = window.innerHeight;

  oceanDots.forEach((dot,index)=>{

    const body = dot.body;

    const waveX =
    Math.sin(timestamp / 2200 + dot.phase) * 0.000012;

    const waveY =
    Math.cos(timestamp / 2800 + dot.phase) * 0.000009;

    const slowDrift =
    Math.sin(timestamp / 4200) * 0.000006;

    Body.applyForce(
      body,
      body.position,
      {
        x:waveX + slowDrift,
        y:waveY
      }
    );

    const velocity = body.velocity;
    const speed =
    Math.sqrt(
      velocity.x * velocity.x +
      velocity.y * velocity.y
    );

    const maxSpeed = 0.85;

    if(speed > maxSpeed){
      Body.setVelocity(body,{
        x:(velocity.x / speed) * maxSpeed,
        y:(velocity.y / speed) * maxSpeed
      });
    }

    if(body.position.y < OCEAN_TOP_SAFE_AREA){
      Body.applyForce(
        body,
        body.position,
        {x:0,y:0.00006}
      );
    }

    if(body.position.x < OCEAN_DOT_RADIUS){
      Body.applyForce(
        body,
        body.position,
        {x:0.00006,y:0}
      );
    }

    if(body.position.x > width - OCEAN_DOT_RADIUS){
      Body.applyForce(
        body,
        body.position,
        {x:-0.00006,y:0}
      );
    }

    if(body.position.y > height - OCEAN_DOT_RADIUS){
      Body.applyForce(
        body,
        body.position,
        {x:0,y:-0.00006}
      );
    }

  });

}

function animateOceanDots(timestamp){

  if(oceanLastTimestamp === null){
    oceanLastTimestamp = timestamp;
  }

  oceanLastTimestamp = timestamp;

  applyOceanWaterMotion(timestamp);

  oceanDots.forEach(dot=>{

    dot.el.style.left =
    `${dot.body.position.x}px`;

    dot.el.style.top =
    `${dot.body.position.y}px`;

  });

  oceanDotsFrame =
  requestAnimationFrame(animateOceanDots);

}

function updateOceanSlide(){

  const oceanSlide = document.getElementById("slide9");

  if(!oceanSlide) return;

  const progress = oceanProgress;
  const eased = easeInOutCubic(progress);

  const year = Math.round(
    lerp(
      oceanData.yearStart,
      oceanData.yearEnd,
      progress
    )
  );

  const plastic = lerp(
    oceanData.plasticStart,
    oceanData.plasticEnd,
    eased
  );

  const percent = Math.round(
    (plastic / OCEAN_FISH_MIO) * 100
  );

  const yearEl = document.getElementById("oceanYear");
  const plasticEl = document.getElementById("oceanPlasticValue");
  const percentEl = document.getElementById("oceanPercent");

  if(yearEl) yearEl.textContent = year;
  if(plasticEl) plasticEl.textContent = Math.round(plastic);
  if(percentEl) percentEl.textContent = `${percent}%`;

  const plasticDotCount = Math.round(
    OCEAN_DOT_COUNT * (percent / 100)
  );

  oceanDots.forEach((dot,index)=>{
    dot.el.classList.toggle(
      "is-plastic",
      index < plasticDotCount
    );
  });

}

function animateOcean(timestamp){

  if(oceanAnimationStartedAt === null){
    oceanAnimationStartedAt = timestamp;
  }

  const rawProgress =
  (timestamp - oceanAnimationStartedAt) / OCEAN_DURATION;

  oceanProgress = Math.min(rawProgress,1);

  updateOceanSlide();

  if(oceanProgress < 1){
    oceanAnimationFrame =
    requestAnimationFrame(animateOcean);
  }else{
    oceanAnimationFrame = null;
    oceanAnimationStartedAt = null;
  }

}

function startOceanAnimation(){

  initOceanDots();

  if(oceanAnimationFrame){
    cancelAnimationFrame(oceanAnimationFrame);
  }

  oceanProgress = 0;
  oceanAnimationStartedAt = null;
  updateOceanSlide();

  oceanAnimationFrame =
  requestAnimationFrame(animateOcean);

}

function resetOceanAnimation(){

  if(oceanAnimationFrame){
    cancelAnimationFrame(oceanAnimationFrame);
    oceanAnimationFrame = null;
  }

  oceanAnimationStartedAt = null;
  oceanProgress = 0;

  updateOceanSlide();

}

function toggleOceanAnimation(){

  if(oceanProgress > 0 || oceanAnimationFrame){
    resetOceanAnimation();
  }else{
    startOceanAnimation();
  }

}


/* microplastic snow slide */

const MICRO_SNOW_INTERVAL = 110;
const MICRO_SNOW_MAX_PARTICLES = 180;
const MICRO_SNOW_SIZE = BALL_SIZE / 4;
const MICRO_SNOW_RADIUS = MICRO_SNOW_SIZE / 2;

let microSnowParticles = [];
let microSnowInterval = null;
let microSnowFrame = null;
let microSnowStarted = false;
let microSnowWalls = [];

const microSnowEngine = Engine.create();
microSnowEngine.gravity.x = 0;
microSnowEngine.gravity.y = 0.38;

const microSnowRunner = Runner.create();

function createMicroSnowWalls(){

  if(microSnowWalls.length){
    World.remove(microSnowEngine.world,microSnowWalls);
    microSnowWalls = [];
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const wallSize = 120;

  microSnowWalls = [
    Bodies.rectangle(
      width / 2,
      height + wallSize / 2,
      width,
      wallSize,
      {
        isStatic:true,
        render:{visible:false}
      }
    ),
    Bodies.rectangle(
      -wallSize / 2,
      height / 2,
      wallSize,
      height * 2,
      {
        isStatic:true,
        render:{visible:false}
      }
    ),
    Bodies.rectangle(
      width + wallSize / 2,
      height / 2,
      wallSize,
      height * 2,
      {
        isStatic:true,
        render:{visible:false}
      }
    )
  ];

  World.add(microSnowEngine.world,microSnowWalls);

}


function getActiveMicroSnowContainer(){

  const activeSlide = slides[currentSlide];

  if(!activeSlide) return null;

  return activeSlide.querySelector(".micro-snow");

}

function createMicroSnowParticle(){

  const container =
  getActiveMicroSnowContainer();

  if(!container) return;

  if(microSnowParticles.length >= MICRO_SNOW_MAX_PARTICLES){

    const oldParticle = microSnowParticles.shift();

    Composite.remove(
      microSnowEngine.world,
      oldParticle.body
    );

    oldParticle.el.remove();

  }

  const el =
  document.createElement("div");

  el.className = "micro-snow-ball";

  container.appendChild(el);

  const body = Bodies.circle(

    MICRO_SNOW_RADIUS +
    Math.random() *
    (window.innerWidth - MICRO_SNOW_SIZE),

    -MICRO_SNOW_RADIUS,

    MICRO_SNOW_RADIUS,

    {
      restitution:0.05,
      friction:0.9,
      frictionAir:0.012,
      density:0.0008,
      render:{visible:false}
    }

  );

  Body.setVelocity(body,{
    x:(Math.random() - 0.5) * 0.8,
    y:1 + Math.random() * 1.5
  });

  World.add(microSnowEngine.world,body);

  microSnowParticles.push({el,body});

}

function animateMicroSnow(){

  microSnowParticles.forEach(particle=>{

    particle.el.style.left =
    `${particle.body.position.x}px`;

    particle.el.style.top =
    `${particle.body.position.y}px`;

  });

  microSnowFrame =
  requestAnimationFrame(animateMicroSnow);

}

function startMicroSnow(){

  const container =
  getActiveMicroSnowContainer();

  if(!container) return;

  if(!microSnowStarted){

    microSnowStarted = true;

    createMicroSnowWalls();
    Runner.run(microSnowRunner,microSnowEngine);

  }

  if(!microSnowInterval){
    microSnowInterval =
    setInterval(
      createMicroSnowParticle,
      MICRO_SNOW_INTERVAL
    );
  }

  if(!microSnowFrame){
    microSnowFrame =
    requestAnimationFrame(animateMicroSnow);
  }

}

function stopMicroSnow(){

  if(microSnowInterval){
    clearInterval(microSnowInterval);
    microSnowInterval = null;
  }

  if(microSnowFrame){
    cancelAnimationFrame(microSnowFrame);
    microSnowFrame = null;
  }

  Runner.stop(microSnowRunner);
  microSnowStarted = false;

  microSnowParticles.forEach(particle=>{
    Composite.remove(
      microSnowEngine.world,
      particle.body
    );
    particle.el.remove();
  });

  microSnowParticles = [];

}


setInterval(updateFateChart,250);
updateCounters();
showSlide(0);
