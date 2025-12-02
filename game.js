/* ======================================================
   game.js (스낵 몰래 먹기 + Hard 마이크 + eduMusic 랜덤 재생)
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

let eduMusic;             // ★ 게임 내부 음악
let eduMusicStartOffset = 0;

/* -----------------------------------------
   HARD MODE MIC
----------------------------------------- */
let mic = null;
let micLevel = 0;
let micThreshold = 0.005;

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

  // ★ 게임 배경 음악
  eduMusic = loadSound("image/edu.mp3");
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

  // ★ Hard 모드: 마이크 활성화
  if (gameDifficulty === "hard") {
    mic = new p5.AudioIn();
    mic.start();
  } else {
    mic = null;
  }

  // ★ 매판 랜덤 시작 위치 (0~10초)
  eduMusicStartOffset = random(0, 10);

  // ★ 기존 재생 중이면 정지
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

      // ★ 걸림 처리
      if (!before && teacherFacing && cookieVisible) {

        health--;
        cookieVisible = false;
        currentBackground = "down";
        forceFrontFeel = true;

        // ★ 걸리면 음악 멈춤
        if (eduMusic && eduMusic.isPlaying()) {
          eduMusic.pause();
        }

        setTimeout(() => {
          forceFrontFeel = false;

          // ★ 다시 음악 재생
          if (eduMusic && !eduMusic.isPlaying()) {
            eduMusic.play();
          }

          if (health <= 0) {
            score = snackProgress;
            gameState = "gameover";
          }
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

  // ★ 게임 음악 자동 재생 + 랜덤 구간 jump
  if (eduMusic && !eduMusic.isPlaying() && !forceFrontFeel) {
    eduMusic.play();
    eduMusic.jump(eduMusicStartOffset);
  }

  // ★ Hard 모드 마이크 먹기 판정
  if (gameDifficulty === "hard" && mic) {
    micLevel = mic.getLevel();
    isPressed = micLevel > micThreshold;
  }

  // 배경
  if (currentBackground === "up") image(backgroundUp, 0, 0, width, height);
  else image(backgroundDown, 0, 0, width, height);

  let elapsed = millis() - startTime;
  let remaining = max(0, gameDuration - elapsed);

  if (remaining <= 0) {
    score = snackProgress;
    gameState = "timeout";
    return;
  }

  /* TIMER UI ==================================================== */
  let tX = width - 90;
  let tY = 70;
  let tR = 35;

  fill(255);
  ellipse(tX, tY, tR*2);

  fill(255, 80, 80);
  let startAngle = -HALF_PI;
  let endAngle = startAngle + TWO_PI * (remaining / gameDuration);
  arc(tX, tY, tR*2, tR*2, startAngle, endAngle, PIE);

  noFill();
  stroke(100);
  strokeWeight(3);
  ellipse(tX, tY, tR*2);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(`점수: ${snackProgress}`, tX, tY+50);

  /* HEART ====================================================== */
  let heartsY = tY + 80;
  let heartSize = 26;
  let startX = tX - 40;
  for (let i = 0; i < 3; i++) {
    let img = i < health ? heartFull : heartBroken;
    image(img, startX + i*35, heartsY, heartSize, heartSize);
  }

  /* TEACHER ===================================================== */
  let imgToShow = imgFront;
  if (forceFrontFeel) imgToShow = imgFrontFeel;
  else if (turning && nextFacing) imgToShow = imgBackFeel;
  else if (!teacherFacing) imgToShow = imgBack;

  image(imgToShow, width/1.75 - 100, height/3.5, 200, 200);

  /* PLAYER ====================================================== */
  let cx = width/1.25;
  let cy = height/1.5;
  let r = 100;

  let playerImg;
  if (forceFrontFeel) playerImg = imgEatFind;
  else if (isPressed && cookieVisible && !teacherFacing && !turning) {
    if (millis() - lastScoreTime < 150) playerImg = imgEating;
    else playerImg = imgEat;
  }
  else playerImg = imgNormal;

  fill(255,255,255,230);
  noStroke();
  ellipse(cx, cy, r*2);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(cx, cy, r, 0, TWO_PI);
  drawingContext.clip();

  image(playerImg, cx-r+15, cy-r+15, r*2.1, r*2.1);

  if (cookieVisible) {
    image(imgCookie, cx*1.05, cy - 20, 40, 40);
  }

  drawingContext.restore();

  stroke(0);
  noFill();
  strokeWeight(2);
  ellipse(cx, cy, r*2);

  /* SCORING ===================================================== */
  if (isPressed && cookieVisible) {

    if (teacherFacing && !turning) {
      score = snackProgress;
      gameState = "gameover";
      return;
    }

    if (!teacherFacing && !turning && millis()-lastScoreTime >= 200) {
      // ★ 테스트용: 한 번 먹을 때마다 10점씩 증가
      //   (필요하면 1 / 5점 등으로 다시 조정 가능)
      snackProgress += 10;
      lastScoreTime = millis();

      if (snackProgress >= 100) {
        score = snackProgress;
        gameState = "success";
      }
    }
  }
  // ★ 게임 종료 즉시 eduMusic 정지
  if (gameState === "success" || gameState === "gameover" || gameState === "timeout") {
    if (eduMusic && eduMusic.isPlaying()) {
        eduMusic.stop();
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

function updateSnackGame() { }
