/* ======================================================
   sketch.js  (UI + 화면전환 + 버튼 + 애니메이션)
   기존 코드 절대 손대지 않음
   게임 부분만 snackGame 으로 연결
====================================================== */

let gameState = 'start'; // 'start', 'selectDifficulty', 'playing', 'gameover', 'timeout', 'success'
let score = 0;
let gameDifficulty = 'easy';

let startButton, rulesButton, easyButton, hardButton, restartButton;
let hoveredButton = null;

let bgImage; 
let motion1, motion2, motion3;
let logoImage;
let buttonImage;

let failBackground;
let failF;
let failProfessor;
let failStudent;

let timeoutStudent;

let successBackground;
let successMotion1;
let successMotion2;

/* -----------------------------------------
   IMAGE LOAD
----------------------------------------- */
function preload() {
  bgImage = loadImage('image/background.png');

  motion1 = loadImage('image/motion1.png');
  motion2 = loadImage('image/motion2.png');
  motion3 = loadImage('image/motion3.png');

  logoImage = loadImage('image/logo.png');
  buttonImage = loadImage('image/button.png');

  failBackground = loadImage('image/fail_background.png');
  failF = loadImage('image/fail_F.png');
  failProfessor = loadImage('image/fail_professor.png');
  failStudent = loadImage('image/fail_student.png');

  timeoutStudent = loadImage('image/timeout_student.png');

  successBackground = loadImage('image/success_background.png');
  successMotion1 = loadImage('image/success_motion1.png');
  successMotion2 = loadImage('image/success_motion2.png');

  // ★ 스낵 게임 이미지 로더 추가
  loadGameImages();
}


/* -----------------------------------------
   SETUP
----------------------------------------- */
function setup() {
  createCanvas(800, 600);
  createButtons();
}


/* -----------------------------------------
   DRAW LOOP
----------------------------------------- */
function draw() {
  if (gameState === 'start') {
    drawStartScreen();

  } else if (gameState === 'selectDifficulty') {
    drawDifficultySelectScreen();

  } else if (gameState === 'playing') {
    drawSnackGame();
    updateSnackGame();

  } else if (gameState === 'gameover') {
    drawGameOver();

  } else if (gameState === 'timeout') {
    drawTimeout();

  } else if (gameState === 'success') {
    drawSuccess();
  }
}


/* -----------------------------------------
   BUTTON INITIALIZATION
----------------------------------------- */
function createButtons() {
  let bx = width - 150;
  let by = height - 150;
  let gap = 100;

  rulesButton = { x: bx, y: by - gap/2, size: 80, text: '게임방법' };
  startButton = { x: bx, y: by + gap/2, size: 80, text: '게임시작' };

  easyButton = { x: width/2, y: height/2 - 50, width: 90, height: 90, text: 'Easy' };
  hardButton = { x: width/2, y: height/2 + 50, width: 90, height: 90, text: 'Hard' };

  restartButton = { x: width - 150, y: height - 100, size: 80, text: '다시시작' };
}


/* -----------------------------------------
   START SCREEN
----------------------------------------- */
function drawStartScreen() {
  image(bgImage, 0, 0, width, height);

  if (logoImage) {
    imageMode(CENTER);
    image(logoImage, width/2, 150, logoImage.width*0.1, logoImage.height*0.1);
    imageMode(CORNER);
  }

  drawAnimatedCharacter(width/2, height/2 + 80);

  drawCookieButton(startButton, hoveredButton === 'start', '#8B4513');
  drawCookieButton(rulesButton, hoveredButton === 'rules', '#8B4513');
}


/* -----------------------------------------
   CHARACTER ANIMATION
----------------------------------------- */
function drawAnimatedCharacter(x, y) {
  let idx = Math.floor((frameCount / 60) % 3);
  let img = idx === 0 ? motion1 : idx === 1 ? motion2 : motion3;

  imageMode(CENTER);
  image(img, x, y, img.width*0.8, img.height*0.8);
  imageMode(CORNER);
}


/* -----------------------------------------
   DIFFICULTY SELECT SCREEN
----------------------------------------- */
function drawDifficultySelectScreen() {
  image(bgImage, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255,105,180);
  stroke(255,20,147);
  strokeWeight(5);
  text('난이도를 선택하세요', width/2, 150);

  drawCookieButton(easyButton, hoveredButton === 'easy', '#8B4513');
  drawCookieButton(hardButton, hoveredButton === 'hard', '#8B4513');
}


/* -----------------------------------------
   COOKIE BUTTON (공통)
----------------------------------------- */
function drawCookieButton(btn, hover, colorHex) {
  push();
  translate(btn.x, btn.y);

  if (hover) {
    translate(
      sin(frameCount * 0.5) * 3,
      cos(frameCount * 0.7) * 2
    );
  }

  imageMode(CENTER);

  if (btn.size) {
    image(buttonImage, 0, 0, btn.size, btn.size);
  } else {
    image(buttonImage, 0, 0, btn.width, btn.height);
  }

  imageMode(CORNER);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text(btn.text, 0, 0);

  pop();
}


/* -----------------------------------------
   GAME RESULT SCREENS
----------------------------------------- */
function drawGameOver() {
  background(0);
  imageMode(CORNER);

  image(failBackground, 0, 0, width, height);

  imageMode(CENTER); // CENTER 사용 (임시)
  image(failF, width/2, height/2 - 100, failF.width*0.8, failF.height*0.8);
  image(failProfessor, width/2 -150, height/2 + 50, failProfessor.width*0.35, failProfessor.height*0.35);
  image(failStudent, width/2 +150, height/2 + 50, failStudent.width*0.25, failStudent.height*0.25);

  imageMode(CORNER); // ★★★★★ 핵심: 반드시 원복 ★★★★★

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text('스페이스바를 눌러 다시 시작', width/2, height/2 + 200);
}



/* ----------------------------------------- */
function drawTimeout() {
  background(0);
  imageMode(CORNER);  // ★ 안전하게 초기화
  image(bgImage, 0, 0, width, height);

  fill(0,0,0,180);
  rect(0,0,width,height);

  textAlign(CENTER, CENTER);
  textSize(100);
  fill(255,0,0);
  text('TIME OUT', width/2, height/2 - 50);

  textSize(25);
  fill(255);
  text('스페이스바로 다시 시작', width/2, height/2 + 50);
}



/* ----------------------------------------- */
function drawSuccess() {
  background(0);
  imageMode(CORNER);  // ★ 먼저 초기화
  image(successBackground, 0, 0, width, height);

  let img = (Math.floor(frameCount / 30) % 2 === 0) ? successMotion1 : successMotion2;

  push();               // ★ 상태 보호
  imageMode(CENTER);    // CENTER 사용
  image(img, width/2, height/2, img.width*0.4, img.height*0.4);
  pop();                // ★ imageMode 포함 상태 전부 복원

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text('스페이스바로 다시 시작', width/2, height/2 + 200);
}


/* -----------------------------------------
   MOUSE / KEY INPUT
----------------------------------------- */
function mouseMoved() {
  hoveredButton = null;

  if (gameState === 'start') {
    if (dist(mouseX, mouseY, startButton.x, startButton.y) < startButton.size/2) hoveredButton = 'start';
    else if (dist(mouseX, mouseY, rulesButton.x, rulesButton.y) < rulesButton.size/2) hoveredButton = 'rules';

  } else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX, mouseY, easyButton)) hoveredButton = 'easy';
    else if (isInsideBtn(mouseX, mouseY, hardButton)) hoveredButton = 'hard';

  } else if (['gameover','timeout','success'].includes(gameState)) {
    if (dist(mouseX, mouseY, restartButton.x, restartButton.y) < restartButton.size/2)
      hoveredButton = 'restart';
  }
}

function mousePressed() {
  if (gameState === 'start') {
    if (dist(mouseX, mouseY, startButton.x, startButton.y) < startButton.size/2) gameState='selectDifficulty';
    if (dist(mouseX, mouseY, rulesButton.x, rulesButton.y) < rulesButton.size/2)
      alert("게임방법 설명...");
  }

  else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX, mouseY, easyButton)) { gameDifficulty='easy'; startGame(); }
    if (isInsideBtn(mouseX, mouseY, hardButton)) { gameDifficulty='hard'; startGame(); }

  } else if (['gameover','timeout','success'].includes(gameState)) {
    if (dist(mouseX, mouseY, restartButton.x, restartButton.y) < restartButton.size/2)
      gameState = 'selectDifficulty';
  }
}

function keyPressed() {
  if (gameState === 'playing') {
    snackGameKeyPressed(keyCode);
  }

  if (['gameover','timeout','success'].includes(gameState) && key === ' ') {
    gameState = 'selectDifficulty';
  }
}

function keyReleased() {
  if (gameState === 'playing') {
    snackGameKeyReleased(keyCode);
  }
}


/* -----------------------------------------
   UTIL
----------------------------------------- */
function startGame() {
  console.log("[SYSTEM] 게임 시작됨");

  gameState = "playing";

  // 게임 내부 로직 초기화
  initSnackGame();

  // 🚫 loop(), frameCount = 0 제거
}


function isInsideBtn(px,py,btn) {
  return px > btn.x - btn.width/2 && px < btn.x + btn.width/2 &&
         py > btn.y - btn.height/2 && py < btn.y + btn.height/2;
}
