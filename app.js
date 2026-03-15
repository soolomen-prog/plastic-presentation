const BALL_TON = 13
const MAX_TON = 50000

let slide = 0

const slides = document.querySelectorAll(".slide")

function showSlide(i){

slides.forEach(s=>s.classList.remove("active"))
slides[i].classList.add("active")

}

showSlide(0)

document.addEventListener("keydown",(e)=>{

if(e.key==="ArrowRight"){
slide=Math.min(slide+1,slides.length-1)
showSlide(slide)
}

if(e.key==="ArrowLeft"){
slide=Math.max(slide-1,0)
showSlide(slide)
}

})

/* TIMER */

const timerEl = document.getElementById("timer")

const startTime = Date.now()

function updateTimer(){

const t = Math.floor((Date.now()-startTime)/1000)

const h = String(Math.floor(t/3600)).padStart(2,"0")
const m = String(Math.floor((t%3600)/60)).padStart(2,"0")
const s = String(t%60).padStart(2,"0")

timerEl.textContent = `${h}:${m}:${s}`

}

setInterval(updateTimer,1000)

/* PHYSICS */

const {Engine,Render,Runner,Bodies,Composite} = Matter

const engine = Engine.create()

const canvas = document.getElementById("physics")

const render = Render.create({

canvas:canvas,
engine:engine,
options:{
width:window.innerWidth/2,
height:window.innerHeight,
wireframes:false,
background:"transparent"
}

})

Render.run(render)

const runner = Runner.create()
Runner.run(runner,engine)

/* WALLS */

const floor = Bodies.rectangle(
window.innerWidth/4,
window.innerHeight+50,
window.innerWidth/2,
100,
{isStatic:true}
)

const wallLeft = Bodies.rectangle(-50,0,100,2000,{isStatic:true})
const wallRight = Bodies.rectangle(window.innerWidth/2+50,0,100,2000,{isStatic:true})

Composite.add(engine.world,[floor,wallLeft,wallRight])

/* BALLS */

let totalTon = 0

function spawnBall(){

const ball = Bodies.circle(

Math.random()*(window.innerWidth/2-100)+50,
-50,
50,

{
restitution:0.4,
friction:0.3,
render:{fillStyle:"#D5FB11"}
}

)

Composite.add(engine.world,ball)

totalTon += BALL_TON

updateScale()

}

setInterval(spawnBall,1000)

/* SCALE */

const marker = document.getElementById("marker")
const tonText = document.getElementById("tonCount")

function updateScale(){

tonText.textContent = totalTon.toLocaleString("de-DE")+" t"

const h = window.innerHeight

const pos = h - (totalTon/MAX_TON)*h

marker.style.top = pos+"px"

}
