const BALL_TON = 13;
const MAX_TON = 50000;

const BALL_SIZE = 50;
const BALL_RADIUS = BALL_SIZE / 2;
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

/* TIMER */

const startTime = Date.now();

function updateTimer() {
  const t = Math.floor((Date.now() - startTime) / 1000);

  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");

  timerEl.textContent = `${h}:${m}:${s}`;
}

updateTimer();
setInterval(updateTimer, 1000);

/* PHYSICS */

const { Engine, Render, Runner, Bodies, Composite, World } = Matter;

const engine = Engine.create();

const canvas = document.getElementById("physics");

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: window.innerWidth / 2,
    height: window.innerHeight,
    wireframes: false,
    background: "transparent"
  }
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

/* WALLS */

let floor;
let wallLeft;
let wallRight;

function createWalls() {
  const halfWidth = window.innerWidth / 2;
  const height = window.innerHeight;

  floor = Bodies.rectangle(
    halfWidth / 2,
    height + 50,
    halfWidth,
    100,
    { isStatic: true, render: { visible: false } }
  );

  wallLeft = Bodies.rectangle(
    -50,
    height / 2,
    100,
    height * 2,
    { isStatic: true, render: { visible: false } }
  );

  wallRight = Bodies.rectangle(
    halfWidth + 50,
    height / 2,
    100,
    height * 2,
    { isStatic: true, render: { visible: false } }
  );

  World.add(engine.world, [floor, wallLeft, wallRight]);
}

createWalls();

/* BALLS */

const balls = [];

function spawnBall() {
  const halfWidth = window.innerWidth / 2;

  const ball = Bodies.circle(
    Math.random() * (halfWidth - BALL_RADIUS * 2) + BALL_RADIUS,
    -BALL_RADIUS,
    BALL_RADIUS,
    {
      restitution: 0.4,
      friction: 0.3,
      render: { fillStyle: "#D5FB11" }
    }
  );

  balls.push(ball);
  Composite.add(engine.world, ball);

  totalTon += BALL_TON;
  updateScale();
}

setInterval(spawnBall, BALL_SPAWN_INTERVAL);

/* SCALE */

function updateScale() {
  if (!markerEl || !tonTextEl) return;

  tonTextEl.textContent = totalTon.toLocaleString("de-DE") + " t";

  const h = window.innerHeight;
  const usableHeight = h - SCALE_TOP_PADDING - SCALE_BOTTOM_PADDING;
  const progress = Math.max(0, Math.min(totalTon / MAX_TON, 1));

  const pos = h - SCALE_BOTTOM_PADDING - progress * usableHeight;

  markerEl.style.top = pos + "px";
}

updateScale();

/* RESIZE */

window.addEventListener("resize", () => {
  render.canvas.width = window.innerWidth / 2;
  render.canvas.height = window.innerHeight;
  render.options.width = window.innerWidth / 2;
  render.options.height = window.innerHeight;

  World.remove(engine.world, [floor, wallLeft, wallRight]);
  createWalls();
  updateScale();
});

showSlide(0);
