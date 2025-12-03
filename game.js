/* ======================================================
   game.js (반응형 적용 + Hard 마이크 + eduMusic 랜덤 재생)
====================================================== */

let teacherFacing = true;
let snackProgress = 0;
let isPressed = false;
let lastScoreTime = 0;
let turning = false;
let nextFacing = false;
let startTime = 0;
let gameDuration = 120000;

let cookieVisible = false;
let health = 3;
let forceFrontFeel = false;

let backgroundUp;
let backgroundDown;

let imgFront, imgBack, imgBackFeel, imgFrontFeel;
let imgNormal, imgEat, imgEating, imgEatFind;
let imgCookie;
let heartFull, heartBroken;

let eduMusic;
let eduMusicStartOffset = 0;

/* -----------------------------------------
   반응형 스케일 설정
----------------------------------------- */
function Sx(v) { return v * (width / 900); }
function Sy(v) { return v * (height / 600); }
function Sr(v) { return v * ((width + height) / 1400); } // radius scaling

/* -----------------------------------------
   LOAD IMAGES + eduMusic
----------------------------------------- */
function loadGameImages() {
  backgroundDown = loadImage("image/background_down.png");
  backgroundUp   = loadImage("image/background_up.png");

  imgFront = loadImage("image/front.png");
  imgBack = loadImage("image/back.png");
  imgBackFeel = loadImage("image/back_feel.png");
  imgFrontFeel = loadImage("image/front_feel.png");

  imgNormal = loadImage("image/normal.png");
  imgEat = loadImage("image/eat.png");
  imgEating = loadImage("image/eating.png");
  imgEatFind = loadImage("image/eat_find.png");

  imgCookie = loadImage("image/cookie.png");

  heartFull = loadImage("image/full_heart.png");
  heartBroken = loadImage("image/broken_heart.png");

  eduMusic = loadSound("image/edu.mp3", () => {
    eduMusic.setVolume(0.2);
  });
}

let currentBackground = "down";

/* -----------------------------------------
   INIT GAME
----------------------------------------- */
function initSnackGame() {
  teacherFacing = true;
  snackProgress = 0;
  cookieVisible = false;
  health = 3;
  forceFrontFeel = false;

  isPressed = false;
  turning = false;
  nextFacing = false;

  currentBackground = "down";

  startTime = millis();
  lastScoreTime = millis();

  eduMusicStartOffset = random(0, 10);
  if (eduMusic && eduMusic.isPlaying()) eduMusic.stop();

  scheduleNextTurn();
}

/* -----------------------------------------
   TURNING SCHEDULER
----------------------------------------- */
function scheduleNextTurn() {
  let interval = random(3000, 4000);

  setTimeout(() => {
    if (gameState !== "playing") return;

    let before = teacherFacing;
    turning = true;
    nextFacing = !teacherFacing;

    setTimeout(() => {
      if (gameState !== "playing") return;

      teacherFacing = nextFacing;
      turning = false;

      if (!before && teacherFacing && cookieVisible) {
        health--;
        cookieVisible = false;
        currentBackground = "down";
        forceFrontFeel = true;

        if (eduMusic && eduMusic.isPlaying()) eduMusic.pause();

        setTimeout(() => {
          forceFrontFeel = false;

          if (health <= 0) {
            score = snackProgress;
            gameState = "gameover";
            if (eduMusic && eduMusic.isPlaying()) eduMusic.stop();
            return;
          }

          if (!eduMusic.isPlaying()) eduMusic.play();

        }, 1500);
      }

      if (gameState === "playing") scheduleNextTurn();

    }, 500);

  }, interval);
}

/* -----------------------------------------
   DRAW GAME
----------------------------------------- */
function drawSnackGame() {
  if (eduMusic && !eduMusic.isPlaying() && !forceFrontFeel && gameState === "playing") {
    eduMusic.play();
    eduMusic.jump(eduMusicStartOffset);
  }

  if (gameDifficulty === "hard" && typeof mic !== "undefined") {
    micLevel = mic.getLevel();
    isPressed = micLevel > micThreshold;
  }

  // 배경 반응형
  image(
    currentBackground === "up" ? backgroundUp : backgroundDown,
    0, 0, width, height
  );

  let elapsed = millis() - startTime;
  let remaining = max(0, gameDuration - elapsed);

  if (remaining <= 0) {
    score = snackProgress;
    gameState = "timeout";
    if (eduMusic && eduMusic.isPlaying()) eduMusic.stop();
    return;
  }

  /* TIMER UI -------------------------------------------------- */
  let tX = Sx(710);
  let tY = Sy(60);
  let tR = Sr(35);

  fill(255);
  ellipse(tX, tY, tR * 2);

  fill(255, 80, 80);
  let startAngle = -HALF_PI;
  let endAngle = startAngle + TWO_PI * (remaining / gameDuration);
  arc(tX, tY, tR*2, tR*2, startAngle, endAngle, PIE);

  noFill();
  stroke(100);
  strokeWeight(Sr(3));
  ellipse(tX, tY, tR * 2);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(Sr(18));
  text(`점수: ${snackProgress}`, tX, tY + Sy(40));

  /* HEART UI -------------------------------------------------- */
  let heartsY = tY + Sy(60);
  let heartSize = Sr(26);
  let startX = tX - Sx(40);

  for (let i = 0; i < 3; i++) {
    let img = i < health ? heartFull : heartBroken;
    image(img, startX + Sx(i * 35), heartsY, heartSize, heartSize);
  }

  /* TEACHER -------------------------------------------------- */
  let imgToShow = imgFront;
  if (forceFrontFeel) imgToShow = imgFrontFeel;
  else if (turning && nextFacing) imgToShow = imgBackFeel;
  else if (!teacherFacing) imgToShow = imgBack;

  image(imgToShow, Sx(420), Sy(160), Sx(200), Sy(200));

  /* PLAYER -------------------------------------------------- */
  let cx = Sx(650);
  let cy = Sy(450);
  let r = Sr(100);

  let playerImg;
  if (forceFrontFeel) playerImg = imgEatFind;
  else if (isPressed && cookieVisible && !teacherFacing && !turning) {
    playerImg = (millis() - lastScoreTime < 150) ? imgEating : imgEat;
  } else {
    playerImg = imgNormal;
  }

  fill(255, 255, 255, 230);
  noStroke();
  ellipse(cx, cy-60, r * 2);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(cx, cy-60, r, 0, TWO_PI);
  drawingContext.clip();

  image(playerImg, cx - r + Sx(15), cy - r + Sy(-20), r * 2.1, r * 2.1);

  if (cookieVisible) {
    push();
    translate(cx + Sx(20) + Sr(30), cy - Sy(35) + Sr(30)); // 중심 기준 이동
    rotate(radians(-160)); // -160도 회전
    imageMode(CENTER);
    image(imgCookie, 0, 0, Sr(60), Sr(60));
    pop();
  }


  drawingContext.restore();

  stroke(0);
  noFill();
  strokeWeight(Sr(2));
  ellipse(cx, cy-60, r * 2);

  /* SCORING -------------------------------------------------- */
  if (isPressed && cookieVisible) {
    if (teacherFacing && !turning) {
      score = snackProgress;
      gameState = "gameover";
      if (eduMusic && eduMusic.isPlaying()) eduMusic.stop();
      return;
    }

    if (!teacherFacing && !turning && millis() - lastScoreTime >= 200) {
      snackProgress += (gameDifficulty === 'hard' ? 4 : 2);
      lastScoreTime = millis();

      if (snackProgress >= 100) {
        score = snackProgress;
        gameState = "success";
      }
    }
  }
}

/* -----------------------------------------
   KEY INPUT
----------------------------------------- */
function snackGameKeyPressed(keyCode) {
  if (gameDifficulty === "easy") {
    if (key === " ") isPressed = true;
  }

  if (keyCode === UP_ARROW) {
    if (!teacherFacing && !turning) {
      currentBackground = "up";
      cookieVisible = true;
    }
  }

  if (keyCode === DOWN_ARROW) {
    if (!teacherFacing && !turning) {
      currentBackground = "down";
      cookieVisible = false;
    }
  }
}

function snackGameKeyReleased(keyCode) {
  if (gameDifficulty === "easy" && key === " ") {
    isPressed = false;
  }
}

/* -----------------------------------------
   UPDATE GAME
----------------------------------------- */
function updateSnackGame() {}
