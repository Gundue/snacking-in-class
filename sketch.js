/* ======================================================
   sketch.js  (UI + 화면전환 + 버튼 + 애니메이션)
   기존 UI 로직 유지 / 게임 로직은 game.js에서 처리
====================================================== */

let gameState = 'start';
let score = 0;
let gameDifficulty = 'easy';
let currentRuleIndex = 0;

let startButton, rulesButton, easyButton, hardButton, restartButton;
let successRestartButton;
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

let bgMusic;          // 메뉴 음악
let rule1, rule2, rule3, rule4;
let nextButton, startFromRuleButton;

// 엔딩 크레딧 스크롤용 변수
let creditsScrollY = 0;
let creditsScrollSpeed = 0.8; // 숫자를 키우면 더 빨리 올라감
let creditsFinished = false;  // 끝까지 올라가면 스크롤 멈춤

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

  // ★ 메뉴 음악 로드
  bgMusic = loadSound('image/Cute Snack Heist.mp3');

  rule1 = loadImage('image/rule1.png');
  rule2 = loadImage('image/rule2.png');
  rule3 = loadImage('image/rule3.png');
  rule4 = loadImage('image/rule4.png');

  // ★ 게임 이미지 & 게임 음악 로드
  console.log("[PRELOAD] 시작");

  bgMusic = loadSound('image/Cute Snack Heist.mp3', 
    () => console.log("[PRELOAD] bgMusic 로드 성공"),
    () => console.log("[PRELOAD] bgMusic 로드 실패")
  );

  console.log("[PRELOAD] preload 끝");
  loadGameImages();
}

function setup() {
  createCanvas(800, 600);
  createButtons();
}

/* -----------------------------------------
   DRAW LOOP
----------------------------------------- */
function draw() {

  /* -----------------------------------------
     MENU / GAME BGM 제어 (정상 처리)
  ----------------------------------------- */
  if (gameState !== "playing") {
    if (typeof eduMusic !== "undefined" && eduMusic.isPlaying()) {
      eduMusic.stop();
    }
  }
  if (gameState !== 'playing') {
    // 게임이 아닐 때는 메뉴 음악 재생
    if (bgMusic && !bgMusic.isPlaying()) {
      bgMusic.setLoop(true);
      bgMusic.play();
    }
  } else {
    // 게임 중이면 메뉴 음악 정지
    if (bgMusic && bgMusic.isPlaying()) {
      bgMusic.stop();
    }
  }

  if (gameState === 'start') drawStartScreen();
  else if (gameState === 'selectDifficulty') drawDifficultySelectScreen();
  else if (gameState === 'rules') drawRulesScreen();
  else if (gameState === 'playing') {
    drawSnackGame();
    updateSnackGame();
  }
  else if (gameState === 'gameover') drawGameOver();
  else if (gameState === 'timeout') drawTimeout();
  else if (gameState === 'success') drawSuccess();
  else if (gameState === 'credits') drawCreditsScreen();
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
  successRestartButton = { x: width - 150, y: height - 100, size: 80, text: '다시시작' };
  
  nextButton = { x: width - 150, y: height - 100, size: 80, text: '다음' };
  startFromRuleButton = { x: width - 150, y: height - 100, size: 80, text: '게임시작' };
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
   RULES SCREEN
----------------------------------------- */
function drawRulesScreen() {
  background(0);
  imageMode(CORNER);

  let currentRule;
  if (currentRuleIndex === 0) currentRule = rule1;
  else if (currentRuleIndex === 1) currentRule = rule2;
  else if (currentRuleIndex === 2) currentRule = rule3;
  else currentRule = rule4;

  if (currentRule) {
    imageMode(CENTER);
    image(currentRule, width/2, height/2, width, height);
    imageMode(CORNER);
  }
}


/* -----------------------------------------
   COOKIE BUTTON
----------------------------------------- */
function drawCookieButton(btn, hover, colorHex) {
  push();
  translate(btn.x, btn.y);

  if (hover) {
    translate(sin(frameCount * 0.5) * 3, cos(frameCount * 0.7) * 2);
  }

  imageMode(CENTER);

  if (btn.size)
    image(buttonImage, 0, 0, btn.size, btn.size);
  else
    image(buttonImage, 0, 0, btn.width, btn.height);

  imageMode(CORNER);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text(btn.text, 0, 0);

  pop();
}


/* -----------------------------------------
   GAME RESULT: GAME OVER
----------------------------------------- */
function drawGameOver() {
  background(0);
  imageMode(CORNER);

  image(failBackground, 0, 0, width, height);

  imageMode(CENTER);
  image(failF, width/2, height/2 - 100, failF.width*0.8, failF.height*0.8);
  image(failProfessor, width/2 -150, height/2 + 50, failProfessor.width*0.35, failProfessor.height*0.35);
  image(failStudent, width/2 +150, height/2 + 50, failStudent.width*0.25, failStudent.height*0.25);

  imageMode(CORNER);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text(`점수: ${score}`, width/2, height/2 + 150);
  
  textSize(30);
  text('스페이스바를 눌러 다시 시작', width/2, height/2 + 200);
}


/* -----------------------------------------
   TIMEOUT SCREEN
----------------------------------------- */
function drawTimeout() {
  background(0);
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  fill(0,0,0,180);
  rect(0,0,width,height);

  textAlign(CENTER, CENTER);
  textSize(100);
  fill(255,0,0);
  text('TIME OUT', width/2, height/2 - 50);

  textSize(40);
  fill(255);
  text(`점수: ${score}`, width/2, height/2 + 20);

  textSize(25);
  fill(255);
  text('스페이스바로 다시 시작', width/2, height/2 + 50);
}


/* -----------------------------------------
   SUCCESS SCREEN
----------------------------------------- */
function drawSuccess() {
  background(0);
  imageMode(CORNER);
  image(successBackground, 0, 0, width, height);

  let img = (Math.floor(frameCount / 30) % 2 === 0)
            ? successMotion1 
            : successMotion2;

  push();
  imageMode(CENTER);
  image(img, width/2, height/2, img.width*0.4, img.height*0.4);
  pop();

  drawCookieButton(successRestartButton, hoveredButton === 'restart', '#8B4513');
}


/* -----------------------------------------
   ENDING CREDITS SCREEN (ending.html 스타일 참고)
   - AI 사용 명시
   - 숭실대학교 디지털미디어학과 결과물 명시
   - AI 사용 비율
   - 사용한 JS / p5.js 기능 요약
----------------------------------------- */
// 필요하면 퍼센트만 수정해서 사용하세요.
let aiUsageRate = '70%';

function drawCreditsScreen() {
  // 전체 배경을 베이지 색(#f5f0e2)으로 채워 엔딩 크레딧 주변도 동일한 색으로 보이게 함
  background(245, 240, 226); // beige (matching ending.html card color)

  // 크레딧 전용 폰트 (index.html에서 불러온 Google Font 사용)
  textFont('Fredoka One');
  noSmooth();

  // 카드 형태 패널 (여백을 조금 넓혀서 텍스트가 안 잘리도록 조정)
  // 카드 형태 패널 - 테두리(틀)를 제거하고 배경과 같은 색으로 평평하게 표시
  noStroke();
  fill(245, 240, 226);
  rectMode(CENTER);
  rect(width / 2, height / 2, 380, 540, 16);
  rectMode(CORNER);

  // 내부 텍스트 스크롤 영역
  const centerX = width / 2;
  const panelTop = height / 2 - 270;
  const panelBottom = height / 2 + 270;

  // 클리핑 영역 설정 (카드 안에서만 글자 보이도록)
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(width / 2 - 180, panelTop + 30, 360, 500);
  drawingContext.clip();

  // 스크롤 위치 업데이트 (위로 이동) - 아직 끝나지 않았을 때만
  if (!creditsFinished) {
    creditsScrollY -= creditsScrollSpeed;
  }

  let y = panelBottom + creditsScrollY; // 아래에서부터 천천히 올라오게
  let lineH = 24;

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);

  // 제목 / 부제
  textSize(30);
  text('미디어앤테크', centerX, y); 
  y += lineH * 1.8;

  textSize(16);
  fill(70);
  text('수업시간에 몰래 먹기', centerX, y);
  y += lineH * 1.8;

  // ━━━ CREDITS ━━━
  fill(0);
  textSize(20);
  text('━━━ CREDITS ━━━', centerX, y);
  y += lineH * 1.4;

  textSize(16);
  text('숭실대학교 디지털미디어학과', centerX, y); y += lineH;
  text('장우진, 정은지, 박건우', centerX, y); y += lineH * 2;

  // ━━━ AI 사용 명시 ━━━
  textSize(20);
  text('━━━ AI 사용 명시 ━━━', centerX, y); 
  y += lineH * 1.4;

  textSize(15);
  fill(60, 60, 220);
  text('⚠️ 본 프로젝트는 AI를 활용하여 제작되었습니다', centerX, y); 
  y += lineH;

  fill(0);
  text('코드 생성 및 디버깅 과정에서', centerX, y); y += lineH;
  text('AI 보조 도구를 사용하였습니다.', centerX, y); y += lineH * 1.5;

  textSize(16);
  text('AI 사용 비율', centerX, y); y += lineH;

  fill(200, 50, 50);
  text(`코드: 약 ${aiUsageRate} AI 지원`, centerX, y); y += lineH;

  fill(0);
  text('(설계 및 기획: 학생 / 구현: AI 보조)', centerX, y); y += lineH * 2;

  // ━━━ TECH STACK ━━━
  textSize(20);
  text('━━━ TECH STACK ━━━', centerX, y); 
  y += lineH * 1.4;

  textSize(15);
  textAlign(LEFT, TOP);
  let x = centerX - 150;

  // JavaScript
  text('JavaScript', x, y); y += lineH;
  text('- ES6 문법: let/const, 함수, 템플릿 리터럴', x, y); y += lineH;
  text('- 조건문(if/else), 반복문(for), 배열/객체', x, y); y += lineH;
  text('- setTimeout()을 이용한 타이머/상태 전환', x, y); y += lineH;
  text('- 이벤트 기반 로직(mouse, keyboard)', x, y); y += lineH * 1.5;

  // p5.js
  text('p5.js', x, y); y += lineH;
  text('- 구조: preload(), setup(), draw()', x, y); y += lineH;
  text('- 그래픽: image(), text(), rect(), ellipse()', x, y); y += lineH;
  text('- 상태 관리: frameCount, push()/pop(),', x, y); y += lineH;
  text('           imageMode(), clip() 등을 활용한 연출', x, y); y += lineH;
  text('- 입력: mouseMoved(), mousePressed(),', x, y); y += lineH;
  text('       keyPressed(), keyReleased()', x, y); y += lineH;
  text('- 사운드: loadSound(), isPlaying(), play(),', x, y); y += lineH;
  text('         stop(), pause(), jump(), AudioIn,', x, y); y += lineH;
  text('         getLevel()을 이용한 마이크 입력 처리', x, y); y += lineH * 1.5;

  // 마지막 줄 위치를 기준으로 "끝까지 올라갔는지" 체크
  // 마지막 텍스트가 패널 상단을 충분히 지나가면 더 이상 스크롤하지 않음
  const contentBottomY = y;
  if (!creditsFinished && contentBottomY + creditsScrollY < panelTop + 60) {
    creditsFinished = true;
  }

  drawingContext.restore();

  // 하단 안내 문구는 패널 아래쪽에 고정
  fill(0);
  textAlign(CENTER, TOP);

  // 다른 화면에 영향이 가지 않도록 부드러운 렌더링 복원
  smooth();
}


/* -----------------------------------------
   MOUSE INPUT
----------------------------------------- */
function mouseMoved() {
  hoveredButton = null;

  if (gameState === 'start') {
    if (dist(mouseX, mouseY, startButton.x, startButton.y) < startButton.size/2)
      hoveredButton = 'start';
    else if (dist(mouseX, mouseY, rulesButton.x, rulesButton.y) < rulesButton.size/2)
      hoveredButton = 'rules';
  }

  else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX, mouseY, easyButton)) hoveredButton = 'easy';
    else if (isInsideBtn(mouseX, mouseY, hardButton)) hoveredButton = 'hard';
  }

  else if (gameState === 'rules') {
    if (mouseX < width / 2) {
      if (currentRuleIndex > 0) hoveredButton = 'prev';
    } else {
      if (currentRuleIndex === 3) hoveredButton = 'startFromRule';
      else hoveredButton = 'next';
    }
  }

  else if (['gameover','timeout'].includes(gameState)) {
    if (dist(mouseX, mouseY, restartButton.x, restartButton.y) < restartButton.size/2)
      hoveredButton = 'restart';
  }

  else if (gameState === 'success') {
    if (dist(mouseX, mouseY, successRestartButton.x, successRestartButton.y) < successRestartButton.size/2)
      hoveredButton = 'restart';
  }

  else if (gameState === 'credits') {
    // 크레딧 화면에서는 hover 개념이 중요하지 않으므로 별도 처리 없음
  }
}

function mousePressed() {

  try {
    userStartAudio();
    if (bgMusic && !bgMusic.isPlaying()) {
      bgMusic.setLoop(true);
      bgMusic.play();
    }
  } catch (e) {
    console.log("Audio unlock failed", e);
  }
  if (gameState === 'start') {

    // ★ 버튼 클릭 시 bgMusic을 허용된 타이밍(user gesture)에 재생
    if (dist(mouseX, mouseY, startButton.x, startButton.y) < startButton.size/2) {
      if (bgMusic && !bgMusic.isPlaying()) bgMusic.play();
      gameState='selectDifficulty';
    }

    if (dist(mouseX, mouseY, rulesButton.x, rulesButton.y) < rulesButton.size/2) {
      if (bgMusic && !bgMusic.isPlaying()) bgMusic.play();
      currentRuleIndex = 0;
      gameState = 'rules';
    }
  }

  else if (gameState === 'rules') {
    if (mouseX < width / 2) {
      if (currentRuleIndex > 0) currentRuleIndex--;
    } else {
      if (currentRuleIndex === 3) gameState = 'selectDifficulty';
      else currentRuleIndex++;
    }
  }

  else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX, mouseY, easyButton)) { gameDifficulty='easy'; startGame(); }
    if (isInsideBtn(mouseX, mouseY, hardButton)) { gameDifficulty='hard'; startGame(); }
  }

  else if (['gameover','timeout'].includes(gameState)) {
    if (dist(mouseX, mouseY, restartButton.x, restartButton.y) < restartButton.size/2)
      gameState = 'selectDifficulty';
  }

  else if (gameState === 'success') {
    if (dist(mouseX, mouseY, successRestartButton.x, successRestartButton.y) < successRestartButton.size/2) {
      // 크레딧 시작 시 스크롤 상태 초기화
      gameState = 'credits';
      creditsScrollY = 0;
      creditsFinished = false;
    }
  }

  else if (gameState === 'credits') {
    // 크레딧 화면 아무 곳이나 클릭 시 시작 화면으로 복귀
    gameState = 'start';
  }
}


/* -----------------------------------------
   KEY INPUT
----------------------------------------- */
function keyPressed() {
  if (gameState === 'playing') {
    snackGameKeyPressed(keyCode);
  }

  if (['gameover','timeout','success'].includes(gameState) && key === ' ') {
    gameState = 'selectDifficulty';
  }
}

// 엔딩 크레딧에서 스페이스바 입력 처리
function keyTyped() {
  if (gameState === 'credits' && key === ' ') {
    gameState = 'start';
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
  initSnackGame();
}

function isInsideBtn(px,py,btn) {
  return px > btn.x - btn.width/2 && px < btn.x + btn.width/2 &&
         py > btn.y - btn.height/2 && py < btn.y + btn.height/2;
}
