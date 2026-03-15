const BALL_TON = 13;
const MAX_TON = 50000;

const BALL_SIZE = 28;

const BALL_SPAWN_INTERVAL = 1000;

const SCALE_TOP_PADDING = 40;
const SCALE_BOTTOM_PADDING = 120;

let currentSlide = 0;
let totalTon = 0;

const slides = document.querySelectorAll(".slide");
const timerEl = document.getElementById("timer");
const markerEl = document.getElementById("marker");
const tonTextEl = document.getElementById("tonCount");

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    showSlide(currentSlide + 1);
  }
  if (e.key === "ArrowLeft") {
    showSlide(currentSlide - 1);
  }
});

/* timer */

const startTime = Date.now();

function updateTimer() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  const h = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(elapsedSeconds % 60).padStart(2, "0");

  timerEl.textContent = `${h}:${m}:${s}`;
}

updateTimer();
setInterval(updateTimer, 1000);

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
engine.gravity.y = 1.05;

const canvas = document.getElementById("physics");

const render = Render.create({
  canvas,
  engine,
  options: {
    width: Math.floor(window.innerWidth / 2),
    height: window.innerHeight,
    wireframes: false,
    background: "transparent",
  }
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

let floor;
let wallLeft;
let wallRight;
let ceiling;

function createWalls() {
  const width = window.innerWidth / 2;
  const height = window.innerHeight;

  floor = Bodies.rectangle(width / 2, height + 50, width, 100, {
    isStatic: true,
    render: { visible: false }
  });

  wallLeft = Bodies.rectangle(-50, height / 2, 100, height * 2, {
    isStatic: true,
    render: { visible: false }
  });

  wallRight = Bodies.rectangle(width + 50, height / 2, 100, height * 2, {
    isStatic: true,
    render: { visible: false }
  });

  ceiling = Bodies.rectangle(width / 2, -50, width, 100, {
    isStatic: true,
    render: { visible: false }
  });

  World.add(engine.world, [floor, wallLeft, wallRight, ceiling]);
}

createWalls();

const balls = [];

function spawnBall() {
  const width = window.innerWidth / 2;

  const ball = Bodies.circle(
    Math.random() * (width - BALL_SIZE) + BALL_RADIUS,
    -40,
    BALL_RADIUS,
    {
      restitution: 0.45,
      friction: 0.02,
      frictionAir: 0.002,
      density: 0.0012,
      render: {
        fillStyle: "#D5FB11"
      }
    }
  );

  balls.push(ball);
  Composite.add(engine.world, ball);

  totalTon += BALL_TON;
  updateScale();
}

setInterval(spawnBall, BALL_SPAWN_INTERVAL);

function updateScale() {
  tonTextEl.textContent = `${totalTon.toLocaleString("de-DE")} t`;

  const viewHeight = window.innerHeight;
  const usableHeight = viewHeight - SCALE_TOP_PADDING - SCALE_BOTTOM_PADDING;

  const progress = Math.max(0, Math.min(totalTon / MAX_TON, 1));
  const y = viewHeight - SCALE_BOTTOM_PADDING - progress * usableHeight;

  markerEl.style.top = `${y}px`;
}

updateScale();

window.addEventListener("resize", () => {
  render.canvas.width = Math.floor(window.innerWidth / 2);
  render.canvas.height = window.innerHeight;
  render.options.width = Math.floor(window.innerWidth / 2);
  render.options.height = window.innerHeight;

  World.remove(engine.world, [floor, wallLeft, wallRight, ceiling]);
  createWalls();
  updateScale();
});

showSlide(0);
