const root = document.documentElement;

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

let tx = 0.5, ty = 0.3;
let mx = tx, my = ty;

function setPos(clientX, clientY) {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  tx = clamp(clientX / w, 0, 1);
  ty = clamp(clientY / h, 0, 1);
}

window.addEventListener("mousemove", (e) => setPos(e.clientX, e.clientY), { passive: true });
window.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  setPos(t.clientX, t.clientY);
}, { passive: true });

let last = performance.now();
let phase = 0;

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const follow = 1 - Math.pow(0.00008, dt);
  mx += (tx - mx) * follow;
  my += (ty - my) * follow;

  const wobble = 0.012;
  const px = mx + Math.sin(now * 0.0022) * wobble;
  const py = my + Math.cos(now * 0.0019) * wobble;

  root.style.setProperty("--mx", (px * 100).toFixed(3) + "vw");
  root.style.setProperty("--my", (py * 100).toFixed(3) + "vh");

  phase += dt * 2.2;
  root.style.setProperty("--t", String(phase));

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const choices = document.getElementById("choices");

const scene1 = document.getElementById("scene1");
const scene2 = document.getElementById("scene2");
const scene3 = document.getElementById("scene3");

let yesScale = 1;
let noScale = 1;

let noX = 0.65;
let noY = 0.50;

let yesX = 0.35;
let yesY = 0.50;

let cursorX = 0.50;
let cursorY = 0.50;

function applyPositions(){
  const w = choices.clientWidth || 1;
  const h = choices.clientHeight || 1;

  yesBtn.style.left = (yesX * w) + "px";
  yesBtn.style.top = (yesY * h) + "px";

  noBtn.style.left = (noX * w) + "px";
  noBtn.style.top = (noY * h) + "px";
}

function nudgeScales(){
  yesScale = clamp(yesScale + 0.12, 1, 3.0);
  noScale = clamp(noScale - 0.08, 0.30, 1);

  yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
  noBtn.style.transform = `translate(-50%, -50%) scale(${noScale})`;
}

choices.addEventListener("mousemove", (e) => {
  const r = choices.getBoundingClientRect();
  cursorX = clamp((e.clientX - r.left) / r.width, 0, 1);
  cursorY = clamp((e.clientY - r.top) / r.height, 0, 1);
}, { passive: true });

choices.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  const r = choices.getBoundingClientRect();
  cursorX = clamp((t.clientX - r.left) / r.width, 0, 1);
  cursorY = clamp((t.clientY - r.top) / r.height, 0, 1);
}, { passive: true });

noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  nudgeScales();
});

noBtn.addEventListener("mouseenter", () => {
  nudgeScales();
});

function showScene(a, b){
  a.classList.add("hidden");
  b.classList.remove("hidden");
}

const noteEl = document.getElementById("note");
const noteWrap = document.getElementById("noteWrap");
const noteHint = document.getElementById("noteHint");
const replayBtn = document.getElementById("replayBtn");

const noteLines = [
  "hey chud, its fat emfart here. i didnt tell you i was making this im gonna be honest...",
  "i figured if i did, youd get your hopes up and you know im not talented.",
  "anywho, i wanted to make this for you because its a day i havent celebrated in a while.",
  "maybe today i wont even celebrate it. but i want you to have at least something to smile about.",
  "now, im not going to ask you to be my valentine since im 99% sure youd say no.",
  "however though but though but perchance if you want to, you know where to reach me and tell me........",
  "okay okay sorry... i know its been a rough few months for you. you tend to have these rough patches.",
  "however, i dont think you ever had someone there for you. thats why im here now. im someone you can rely on chud.",
  "im someone who will be willing to listen to you and be there for you through anything and everything.",
  "im not sure exactly what it is you did to me, but you ignited some flame in my soul to pracitcally exist for you only.",
  "i want to laugh with you, cry with you, smile with you, be stupid with you, all because you make those little things matter.",
  "i remember long ago we said that little things matter the most. well, you show me little things every single day that just blow me away.",
  "you might have aids now. but you know what i told you?",
  "no matter what chud i will always see you as my shining star.",
  "love is indigestion.",
  "in sickness and in health lil brah.",
  "you skyla, are the reason im happy. the reason i smile and the reason breathing fresh air feels so good.",
  "no matter what path your life takes, in each one, im always there. proud of you, loving you, whether its close or from a distance.",
  "you are one spectacular girl. such so that no matter the case of your feelings and your strength, you deserve to have a good valentines day.",
  "truthfully, you deserve to have a good day every day but at least for today - february 14th, 2026, i can guarantee you have a good valentines day.",
  "with you, ive experienced insatiable fits of happiness and joy. youve made me a better person and you genuinely make me stronger.",
  "i know we have a big disparity in our feelings for each other, however that doesnt change mine for you.",
  "sometimes, i feel really stupid for feeling the way i do about you but then i remember that theres no universe where id ever apologize for it.",
  "i cant control it. and frankly, i dont want to. i am happy feeling the way i do for you.",
  "anywhom, with that all being said, i hope you have a great valentines day you pretty pretty beautiful girl.",
  "i cant give you flowers phsyically, so here is what i have for you now...",
  "💐💐💐💐💐💐💐💗💗💗💗💗💗💗",
  "EMFART, OUT!!!"
];

let lineIndex = 0;
let typing = false;
let awaitingClick = false;
let timerId = null;

function clearTimer(){
  if (timerId !== null){
    clearTimeout(timerId);
    timerId = null;
  }
}

function typeLine(line){
  typing = true;
  awaitingClick = false;
  noteHint.textContent = "";
  let i = 0;
  const base = 22;
  const jitter = 16;

  function step(){
    if (i >= line.length){
      typing = false;
      awaitingClick = true;
      noteHint.textContent = lineIndex < noteLines.length - 1 ? "click to continue" : "click to finish";
      return;
    }
    noteEl.textContent += line[i];
    noteEl.scrollTop = noteEl.scrollHeight;
    i++;
    const wait = base + Math.random() * jitter + (line[i - 1] === "," ? 70 : 0);
    timerId = setTimeout(step, wait);
  }

  step();
}

function startNote(){
  clearTimer();
  typing = false;
  awaitingClick = false;
  noteEl.textContent += "\n";
  noteEl.scrollTop = noteEl.scrollHeight;
  lineIndex = 0;
  typeLine(noteLines[lineIndex]);
}

function nextLine(){
  if (typing) return;
  if (!awaitingClick) return;

  lineIndex++;
  if (lineIndex >= noteLines.length){
    noteHint.textContent = "done";
    awaitingClick = false;
    return;
  }

  noteEl.textContent += "\n";
  typeLine(noteLines[lineIndex]);
}

function noteAdvance(){
  if (scene3.classList.contains("hidden")) return;
  nextLine();
}

noteWrap.addEventListener("click", noteAdvance);
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " "){
    e.preventDefault();
    noteAdvance();
  }
});

replayBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  startNote();
});

let entered = false;

yesBtn.addEventListener("click", () => {
  if (entered) return;
  entered = true;

  showScene(scene1, scene2);

  setTimeout(() => {
    showScene(scene2, scene3);
    startNote();
  }, 2400);
});

function stepChoices(){
  const padX = 0.16;
  const padY = 0.24;

  const chase = 0.06 + (yesScale - 1) * 0.03;
  yesX += (cursorX - yesX) * chase;
  yesY += (cursorY - yesY) * chase;

  yesX = clamp(yesX, padX, 1 - padX);
  yesY = clamp(yesY, padY, 1 - padY);

  const dx = noX - yesX;
  const dy = noY - yesY;
  const d = Math.max(0.001, Math.hypot(dx, dy));

  const push = (0.030 * (1.0 + (yesScale - 1) * 0.8)) / d;
  noX += (dx / d) * push;
  noY += (dy / d) * push;

  const dcx = noX - cursorX;
  const dcy = noY - cursorY;
  const dc = Math.max(0.001, Math.hypot(dcx, dcy));
  const push2 = 0.036 / dc;
  noX += (dcx / dc) * push2;
  noY += (dcy / dc) * push2;

  noX = clamp(noX, padX, 1 - padX);
  noY = clamp(noY, padY, 1 - padY);

  const edgePull = 0.006;
  noX += (0.5 - noX) * edgePull;
  noY += (0.5 - noY) * edgePull;

  applyPositions();
  requestAnimationFrame(stepChoices);
}

window.addEventListener("resize", applyPositions, { passive: true });
applyPositions();
requestAnimationFrame(stepChoices);

const audio = document.getElementById("audio");
const musicBtn = document.getElementById("musicBtn");
const volume = document.getElementById("volume");
const volText = document.getElementById("volText");

const savedVol = localStorage.getItem("val_vol");
const savedOn = localStorage.getItem("val_on");

let vol = savedVol !== null ? clamp(Number(savedVol) || 70, 0, 100) : 70;
volume.value = String(vol);
volText.textContent = `${vol}%`;
audio.volume = vol / 100;

let on = savedOn === null ? true : savedOn === "1";

function syncUI(){
  musicBtn.textContent = on ? "Music: On" : "Music: Off";
  musicBtn.setAttribute("aria-pressed", on ? "true" : "false");
  localStorage.setItem("val_vol", String(Math.round(audio.volume * 100)));
  localStorage.setItem("val_on", on ? "1" : "0");
}

async function tryPlay(){
  if (!on) return false;
  try{
    await audio.play();
    return true;
  }catch(e){
    return false;
  }
}

function armAutoStart(){
  const kick = async () => {
    const ok = await tryPlay();
    if (ok) {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    }
  };
  window.addEventListener("pointerdown", kick, { passive: true });
  window.addEventListener("touchstart", kick, { passive: true });
  window.addEventListener("keydown", kick);
}

volume.addEventListener("input", () => {
  const v = clamp(Number(volume.value) || 0, 0, 100);
  audio.volume = v / 100;
  volText.textContent = `${v}%`;
  localStorage.setItem("val_vol", String(v));
});

musicBtn.addEventListener("click", async () => {
  on = !on;
  if (on) {
    const ok = await tryPlay();
    if (!ok) armAutoStart();
  } else {
    audio.pause();
  }
  syncUI();
});

syncUI();
tryPlay().then(ok => { if (!ok) armAutoStart(); });
