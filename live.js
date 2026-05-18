const BALL_TON = 13;
const BALL_SIZE = 50;
const BALL_RADIUS = BALL_SIZE / 2;

let totalTon = 0;

/* TIMER */

const timerEl = document.getElementById("timer");

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

/* COUNTER */

const counterEl = document.getElementById("counter");

function updateCounter() {

  counterEl.textContent =
    totalTon.toLocaleString("de-DE");
}

updateCounter();

/* PHYSICS */

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  World
} = Matter;

const engine = Engine.create();

const canvas = document.getElementById("physics");

const render = Render.create({

  canvas: canvas,
  engine: engine,

  options: {

    width: window.innerWidth,
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

  const width = window.innerWidth;
  const height = window.innerHeight;

  floor = Bodies.rectangle(
    width / 2,
    height + 50,
    width,
    100,
    {
      isStatic: true,
      render: { visible: false }
    }
  );

  wallLeft = Bodies.rectangle(
    -50,
    height / 2,
    100,
    height * 2,
    {
      isStatic: true,
      render: { visible: false }
    }
  );

  wallRight = Bodies.rectangle(
    width + 50,
    height / 2,
    100,
    height * 2,
    {
      isStatic: true,
      render: { visible: false }
    }
  );

  World.add(engine.world, [
    floor,
    wallLeft,
    wallRight
  ]);
}

createWalls();

/* BALLS */

function spawnBall() {

  const width = window.innerWidth;

  const ball = Bodies.circle(

    Math.random() * (width - BALL_RADIUS * 2) + BALL_RADIUS,

    -BALL_RADIUS,

    BALL_RADIUS,

    {
      restitution: 0.4,
      friction: 0.3,

      render: {
        fillStyle: "#D5FB11"
      }
    }
  );

  Composite.add(engine.world, ball);

  totalTon += BALL_TON;

  updateCounter();
}

setInterval(spawnBall, 1000);

/* RESIZE */

window.addEventListener("resize", () => {

  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;

  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;

  World.remove(engine.world, [
    floor,
    wallLeft,
    wallRight
  ]);

  createWalls();
});
