/* ---------- Smooth gradient follow ---------- */
const root = document.documentElement;
let targetX = 50, targetY = 50;
let currentX = 50, currentY = 50;

document.addEventListener("mousemove", (e) => {
  targetX = (e.clientX / window.innerWidth) * 100;
  targetY = (e.clientY / window.innerHeight) * 100;
});
(function raf() {
  const ease = 0.08;
  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;
  root.style.setProperty("--mx", currentX + "%");
  root.style.setProperty("--my", currentY + "%");
  requestAnimationFrame(raf);
})();

/* ---------- Messages & gradient transition ---------- */
const msg2 = document.getElementById("msg2");
const msg3 = document.getElementById("msg3");

const music = document.getElementById("bg-music");
const audioControls = document.getElementById("audio-controls");
const muteBtn = document.getElementById("mute-btn");
const playBtn = document.getElementById("play-btn");
const volumeSlider = document.getElementById("volume-slider");

let tickerTopPx = null;

msg2.addEventListener("animationend", () => {
  document.addEventListener("click", onFirstClick, { once: true });
});

function onFirstClick() {
  root.style.setProperty("--romantic-fade", "1");
  music.volume = parseFloat(volumeSlider.value);
  music.play().then(() => { playBtn.textContent = "⏸️"; }).catch(() => {});

  msg2.classList.add("exit");
  msg2.addEventListener("transitionend", () => {
    msg2.remove();
    msg3.classList.add("show");
    document.addEventListener("click", onSecondClick, { once: true });
  }, { once: true });

  armControlsAutohide();
}

function onSecondClick() {
  tickerTopPx = positionTickerUnderMsg3();
  msg3.classList.add("exit");
  msg3.addEventListener("transitionend", () => {
    msg3.remove();
    startTicker(tickerTopPx);
  }, { once: true });
}

function positionTickerUnderMsg3(offset = 18) {
  const r = msg3.getBoundingClientRect();
  const topPx = r.bottom + offset;
  const topVh = (topPx / window.innerHeight) * 100;
  root.style.setProperty("--ticker-top", `${topVh}vh`);
  return topPx;
}

window.addEventListener("resize", () => {
  if (document.body.contains(msg3) && msg3.classList.contains("show")) {
    tickerTopPx = positionTickerUnderMsg3();
  }
});

/* ---------- Audio controls ---------- */
muteBtn.addEventListener("click", () => {
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? "🔇" : "🔊";
});

playBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => { playBtn.textContent = "⏸️"; }).catch(() => {});
  } else {
    music.pause();
    playBtn.textContent = "▶️";
  }
});

volumeSlider.addEventListener("input", (e) => {
  music.volume = e.target.value;
});

/* ---------- Auto-hide controls ---------- */
let hideTimer = null;
const HIDE_DELAY = 2500;

function showControls() { audioControls.classList.remove("hidden"); }
function hideControls() { audioControls.classList.add("hidden"); }

function armControlsAutohide() {
  const hotArea = (x, y) => x < 220 && y > window.innerHeight - 160;

  const onMove = (e) => {
    if (hotArea(e.clientX, e.clientY)) {
      showControls();
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(hideControls, HIDE_DELAY);
    }
  };

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hideControls, HIDE_DELAY);

  window.addEventListener("mousemove", onMove);
}

/* ---------- Scrolling list ---------- */
const ticker = document.getElementById("ticker");
const track  = document.getElementById("ticker-track");
const finalMsg = document.getElementById("final-message");

/* Your custom items */
const items = [
  "– buldak (even if you dont like it anymore)",
  "– cars, especially fast and furious",
  "– legos!!",
  "– owls for suresies",
  "– overwatch (by the time you see this ill be unbanned)",
  "– cats MEEOOWWW",
  "– RAISIN CANES BABYYYYY",
  "– lola cause we been twinning before we even knew each other",
  "– valorant (YUCK! but its not yuck when it reminds me of you)",
  "– eating cause we're both huge",
  "– sleeping cause we love doing that (you especially)",
  "– headaches :( everytime i get one i think of you",
  "– asthma also cause we're twinning",
  "– pennsylvania in general",
  "– taco bell (t-beazy) man its so good",
  "– ice cream like cookie vermonster cake bomb elimination",
  "– crumbl (i hope your cookies are good this week)",
  "– anything funny because to me, i hear a joke and know you can say it better",
  "– anything heart shaped, i always feel like i need to show you",
  "– PINK IN GENERAL BRO ITS JUST YOU",
  "– 2hollis, my goodness you surely put me on even though i slightly knew him before",
  "– anything fun at all because ive had the most fun with you",
  "– PA license plates",
  "– south park",
  "– labubus"
];

function buildTicker() {
  track.innerHTML = "";
  items.forEach(text => {
    const div = document.createElement("div");
    div.className = "ticker-item";
    div.textContent = text;
    track.appendChild(div);
  });
}

/**
 * Start the scrolling list exactly from just under where msg3 was.
 * It scrolls upward through the whole viewport and naturally disappears
 * once it leaves the top of the page, then waits for ONE click to reveal
 * the handwritten birthday message, then another click to show Scene 2 (duo).
 *
 * @param {number} topPx  The pixel Y-position where the ticker begins (from viewport top)
 */
function startTicker(topPx) {
  buildTicker();
  ticker.classList.add("show");

  let y = 0;

  // Measure total content height (all items + gaps)
  const lines = Array.from(track.children);
  const computed = getComputedStyle(track);
  const gap = parseFloat(computed.gap) || 18; // matches CSS gap
  const totalHeight = lines.reduce((sum, el) => sum + el.offsetHeight, 0) + gap * (lines.length - 1);

  // Progressive speed-up
  let speed = 22;    // px/s initial
  const accel = 1;   // px/s^2
  const maxSpeed = 175;

  let prevTs = performance.now();

  function tick(ts) {
    const dt = (ts - prevTs) / 1000;
    prevTs = ts;

    speed = Math.min(maxSpeed, speed + accel * dt);
    y -= speed * dt;

    track.style.transform = `translateY(${y}px)`;

    // When the list's bottom is above the viewport top, stop & prepare final message
    if (topPx + y + totalHeight > -20) {
      requestAnimationFrame(tick);
    } else {
      ticker.remove();
      document.addEventListener("click", revealFinalMessage, { once: true });
    }
  }

  requestAnimationFrame(tick);
}

function revealFinalMessage() {
  finalMsg.classList.add("show");

  const proceed = () => {
    finalMsg.classList.remove("show");
    setTimeout(() => {
      startScene2Duo();
    }, 820); // matches CSS 800ms + a little buffer
  };

  document.addEventListener("click", proceed, { once: true });
}

/* ---------- SCENE 2 (DUO): center message with two side images ---------- */
const scene2 = document.getElementById("scene2");
const sideLeft = document.getElementById("side-left");
const sideRight = document.getElementById("side-right");

const duoSources = [
  "media/obesemory.jpg",
  "media/obesela.png"
];

function startScene2Duo() {
  sideLeft.src = duoSources[0];
  sideRight.src = duoSources[1];

  sideLeft.style.setProperty("--rot", "-2deg");
  sideLeft.style.setProperty("--tilt", "2deg");
  sideRight.style.setProperty("--rot", "2deg");
  sideRight.style.setProperty("--tilt", "2.5deg");

  scene2.classList.add("show");

  // proceed to Scene 3 on next click
  document.addEventListener("click", proceedToScene3, { once: true });
}

/* ---------- SCENE 3: Typewriter + floating images ---------- */
const scene3 = document.getElementById("scene3");
const typewriterEl = document.getElementById("typewriter");
const floatersEl   = document.getElementById("floaters");

/* Typewriter lines */
const typeLines = [
  "hey chud, thought i would show you some things you might like!",
  "now its not everything, but i hope it gets a smile goin.",
  "HERE WE FRICKIN GOOOOOO!!!"
];

/* Scale factor for ALL floater images (no cropping, keeps aspect) */
const FLOATER_SCALE = 0.4; // ← adjust this (e.g., 0.4 = 40% of original)

/* Your images with commented natural dimensions */
const floatImages = [
  { src: "media/buldakafter.png",    w: 220, h: 220 }, // 220x220
  { src: "media/tbellafter.png",     w: 666, h: 375 }, // 666x375
  { src: "media/canesafter.png",     w: 667, h: 374 }, // 667x374
  { src: "media/labubuafter.png",    w: 433, h: 577 }, // 433x577
  { src: "media/chudevoafter.png",   w: 612, h: 408 }, // 612x408
  { src: "media/ow2after.png",       w: 586, h: 426 }, // 586x426
  { src: "media/foodbruhafter2.png", w: 441, h: 566 }, // 441x566
  { src: "media/foodbruhafter.png",  w: 353, h: 482 }, // 353x482
  { src: "media/fireopal.png",       w: 104, h: 105 }, // 104x105
  { src: "media/cat.jpg",            w: 400, h: 533 }  // 400x533
];

function proceedToScene3() {
  scene2.classList.remove("show");
  setTimeout(() => {
    scene3.classList.add("show");
    startTypewriter(typeLines, { charDelay: 38, lineDelay: 550, afterDelay: 1600 });
  }, 720);
}

function startTypewriter(lines, { charDelay = 40, lineDelay = 500, afterDelay = 1500 } = {}) {
  typewriterEl.textContent = "";
  typewriterEl.classList.add("typing");

  let lineIndex = 0;

  function typeNextLine() {
    if (lineIndex >= lines.length) {
      typewriterEl.classList.remove("typing");
      setTimeout(spawnFloaters, afterDelay);
      return;
    }

    const line = lines[lineIndex];
    const lineContainer = document.createElement("div");
    lineContainer.style.margin = lineIndex === 0 ? "0 0 4px 0" : "6px 0 0 0";
    typewriterEl.appendChild(lineContainer);

    let i = 0;
    function tick() {
      lineContainer.textContent = line.slice(0, i + 1);
      i++;
      if (i < line.length) {
        setTimeout(tick, charDelay);
      } else {
        lineIndex++;
        setTimeout(typeNextLine, lineDelay);
      }
    }
    tick();
  }

  typeNextLine();
}

function spawnFloaters() {
  floatersEl.innerHTML = "";
  floatersEl.style.zIndex = "1";

  const noteBox = typewriterEl.getBoundingClientRect();
  const margin = 24;

  floatImages.forEach((imgInfo, idx) => {
    const img = document.createElement("img");
    img.className = "floater";
    img.src = imgInfo.src;
    img.alt = `memory ${idx + 1}`;

    // Apply global scale (preserve aspect; no cropping)
    const wScaled = Math.max(1, Math.round(imgInfo.w * FLOATER_SCALE));
    const hScaled = Math.max(1, Math.round(imgInfo.h * FLOATER_SCALE));
    img.style.width  = wScaled + "px";
    img.style.height = hScaled + "px";

    // random rotation/tilt and speed
    const rot  = (Math.random() * 14 - 7).toFixed(2) + "deg";
    const tilt = (Math.random() * 6 + 2).toFixed(2) + "deg";
    const dur  = (Math.random() * 3 + 6).toFixed(2) + "s";
    img.style.setProperty("--rot", rot);
    img.style.setProperty("--tilt", tilt);
    img.style.setProperty("--dur", dur);

    // avoid the typewriter box
    const { x, y } = findPositionAwayFromBox(wScaled, hScaled, noteBox, margin);
    img.style.left = x + "px";
    img.style.top  = y + "px";

    floatersEl.appendChild(img);

    // after the enter animation completes, start the float
    setTimeout(() => img.classList.add("float"), 820);
  });
}

function findPositionAwayFromBox(w, h, box, margin = 24) {
  const maxAttempts = 80;
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * Math.max(1, window.innerWidth - w));
    const y = Math.floor(Math.random() * Math.max(1, window.innerHeight - h));

    const overlaps =
      x < (box.right + margin) &&
      (x + w) > (box.left - margin) &&
      y < (box.bottom + margin) &&
      (y + h) > (box.top - margin);

    if (!overlaps) return { x, y };
  }
  // fallback along edges if it's too crowded
  const edge = Math.random();
  if (edge < 0.25) return { x: 12, y: 12 };
  if (edge < 0.50) return { x: window.innerWidth - w - 12, y: 12 };
  if (edge < 0.75) return { x: 12, y: window.innerHeight - h - 12 };
  return { x: window.innerWidth - w - 12, y: window.innerHeight - h - 12 };
}
