/* ======================================================
   sketch.js  (UI + 화면전환 + 버튼 + 애니메이션)
   반응형 + 마이크 UI 표시 + 원본 UI 구조 유지
====================================================== */

let gameState = 'start';
let score = 0;
let gameDifficulty = 'easy';
let currentRuleIndex = 0;

let startButton, rulesButton, easyButton, hardButton, restartButton;
let successRestartButton;
let creditsRestartButton;
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

let bgMusic;
let rule1, rule2, rule3, rule4;
let dmLogo;
let nextButton, startFromRuleButton;

// ---- 엔딩 크레딧 스크롤용 변수 ----
let creditsScrollY = 0;
let creditsScrollSpeed = 0.8; // 숫자를 키우면 더 빨리 올라감
let creditsFinished = false;  // 끝까지 올라가면 스크롤 멈춤
let aiUsageRate = '70%';      // AI 사용 비율 (필요시 수정)

// ---- 마이크 UI ----
let mic;
let micLevel = 0;
let micThreshold = 0.005;

let micSliderCfg = {
  x: 0,
  y: 0,
  width: 0,
  height: 6,
  handleR: 7,
  dragging: false
};

let micMin = 0.0;
let micMax = 0.10;

/* -----------------------------------------
   PRELOAD
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

  bgMusic = loadSound('image/Cute Snack Heist.mp3', () => {
    bgMusic.setVolume(0.25);
  });

  rule1 = loadImage('image/rule1.png');
  rule2 = loadImage('image/rule2.png');
  rule3 = loadImage('image/rule3.png');
  rule4 = loadImage('image/rule4.png');

  dmLogo = loadImage('image/dm_logo.png');

  loadGameImages(); // game.js
}

/* -----------------------------------------
   SETUP
----------------------------------------- */
function setup() {
  createCanvas(windowWidth-20, windowHeight-22);
  mic = new p5.AudioIn();
  mic.start();
  createButtons();
}

/* -----------------------------------------
   WINDOW RESIZE → 자동 반응형
----------------------------------------- */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createButtons(); // 좌표 다시 계산
}

/* -----------------------------------------
   DRAW LOOP
----------------------------------------- */
function draw() {
  // 마이크 레벨 업데이트
  if (mic) micLevel = mic.getLevel();

  // 메뉴 BGM 제어
  if (gameState !== 'playing') {
    if (bgMusic && !bgMusic.isPlaying()) {
      bgMusic.setLoop(true);
      bgMusic.play();
    }
  } else {
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

  // 마이크 UI는 게임 중일 때만 표시
  if (gameState === 'playing') {
    drawMicUI();
  }

  drawDMLogo();
}

/* -----------------------------------------
   CREATE BUTTONS (반응형)
----------------------------------------- */
function createButtons() {
  let scaleX = width / 800;
  let scaleY = height / 600;
  let S = (scaleX + scaleY) / 2;

  startButton = { 
    x: width - 150 * scaleX, 
    y: height - 100 * scaleY, 
    size: 100 * S,
    text: '게임시작' 
  };
  rulesButton = { 
    x: width - 150 * scaleX, 
    y: height - 200 * scaleY, 
    size: 100 * S, 
    text: '게임방법' 
  };

  easyButton = {
    x: width/2,
    y: height/2 - 80 * scaleY,
    width: 110 * S,
    height: 110 * S,
    text:'Easy'
  };
  hardButton = {
    x: width/2,
    y: height/2 + 80 * scaleY,
    width: 110 * S,
    height: 110 * S,
    text:'Hard'
  };

  restartButton = {
    x: width - 160 * scaleX,
    y: height - 120 * scaleY,
    size: 90 * S,
    text:'다음'
  };
  successRestartButton = { ...restartButton };
  
  creditsRestartButton = {
    x: width - 150 * scaleX,
    y: height - 100 * scaleY,
    size: 100 * S,
    text: '다시 시작'
  };
}

/* -----------------------------------------
   START SCREEN
----------------------------------------- */
function drawStartScreen() {
  image(bgImage, 0, 0, width, height);

  let Lscale = 2;
  if (logoImage) {
    imageMode(CENTER);
    image(
      logoImage,
      width/2,
      height*0.3,
      logoImage.width * 0.12 * Lscale,
      logoImage.height * 0.12 * Lscale
    );
    imageMode(CORNER);
  }

  drawAnimatedCharacter(width/2, height*0.55);

  drawCookieButton(startButton, hoveredButton === 'start');
  drawCookieButton(rulesButton, hoveredButton === 'rules');
}

/* -----------------------------------------
   ANIMATION
----------------------------------------- */
function drawAnimatedCharacter(x, y) {
  let idx = Math.floor((frameCount / 60) % 3);
  let img = idx === 0 ? motion1 : idx === 1 ? motion2 : motion3;

  let s = 2;  // 비율
  imageMode(CENTER);
  image(img, x, y * 1.1, img.width * 0.7 * s, img.height * 0.7 * s);
  imageMode(CORNER);
}

/* -----------------------------------------
   DIFFICULTY SELECT SCREEN
----------------------------------------- */
function drawDifficultySelectScreen() {
  image(bgImage, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(50 * (width/800));
  fill(255,105,180);
  stroke(255,20,147);
  strokeWeight(5);
  text('난이도를 선택하세요', width/2, height*0.20);

  drawCookieButton(easyButton, hoveredButton === 'easy');
  drawCookieButton(hardButton, hoveredButton === 'hard');
}

/* -----------------------------------------
   RULES SCREEN
----------------------------------------- */
function drawRulesScreen() {
  background(0);

  let currentRule = [rule1, rule2, rule3, rule4][currentRuleIndex];
  if (currentRule) {
    imageMode(CENTER);
    image(currentRule, width/2, height/2, width, height);
    imageMode(CORNER);
  }
}

/* -----------------------------------------
   COOKIE BUTTON (반응형)
----------------------------------------- */
function drawCookieButton(btn, hover) {
  push();
  translate(btn.x, btn.y);

  if (hover) {
    translate(sin(frameCount*0.4)*3, cos(frameCount*0.4)*3);
  }

  imageMode(CENTER);
  let w = btn.size || btn.width;
  let h = btn.size || btn.height;
  image(buttonImage, 0, 0, w, h);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18 * (width/800));
  text(btn.text, 0, 0);

  pop();
}

/* -----------------------------------------
   SQUARE BUTTON (사각형 버튼)
----------------------------------------- */
function drawSquareButton(btn, hover) {
  push();
  translate(btn.x, btn.y);

  if (hover) {
    translate(0, -2);
  }

  let w = btn.width;
  let h = btn.height;
  
  // 사각형 배경
  fill(100, 150, 200);
  if (hover) {
    fill(120, 170, 220);
  }
  stroke(255);
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, w, h, 8);
  
  // 텍스트
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16 * (width/800));
  text(btn.text, 0, 0);

  pop();
}

/* -----------------------------------------
   GAME OVER
----------------------------------------- */
function drawGameOver() {
  image(failBackground, 0, 0, width, height);

  imageMode(CENTER);
  let s = width/800;
  image(failF, width/2, height*0.35, failF.width*0.8*s, failF.height*0.8*s);
  image(failProfessor, width/2-180*s, height*0.6, failProfessor.width*0.35*s, failProfessor.height*0.35*s);
  image(failStudent, width/2+180*s, height*0.6, failStudent.width*0.25*s, failStudent.height*0.25*s);

  textAlign(CENTER, CENTER);
  textSize(40*s);
  fill(255);
  text(`점수: ${score}`, width/2, height*0.75);

  drawCookieButton(restartButton, hoveredButton === 'restart');
}

/* -----------------------------------------
   TIMEOUT
----------------------------------------- */
function drawTimeout() {
  image(bgImage, 0, 0, width, height);
  fill(0,0,0,180);
  rect(0,0,width,height);

  textAlign(CENTER, CENTER);
  textSize(100 * (width/800));
  fill(255,0,0);
  text('TIME OUT', width/2, height*0.40);

  textSize(40 * (width/800));
  fill(255);
  text(`점수: ${score}`, width/2, height*0.55);

  drawCookieButton(restartButton, hoveredButton === 'restart');
}

/* -----------------------------------------
   SUCCESS
----------------------------------------- */
function drawSuccess() {
  image(successBackground, 0, 0, width, height);

  let s = width/800;
  let img = (Math.floor(frameCount / 30) % 2 === 0)
        ? successMotion1 : successMotion2;

  push();
  imageMode(CENTER);
  image(img, width/2, height/2, img.width*0.4*s, img.height*0.4*s);
  pop();

  drawCookieButton(successRestartButton, hoveredButton === 'restart');
}

/* -----------------------------------------
   ENDING CREDITS SCREEN
   - AI 사용 명시
   - 숭실대학교 디지털미디어학과 결과물 명시
   - AI 사용 비율
   - 사용한 JS / p5.js 기능 요약
----------------------------------------- */
function drawCreditsScreen() {
  // 전체 배경을 베이지 색(#f5f0e2)으로 채워 엔딩 크레딧 주변도 동일한 색으로 보이게 함
  background(245, 240, 226); // beige (matching ending.html card color)

  // 크레딧 전용 폰트 (index.html에서 불러온 Google Font 사용)
  textFont('Fredoka One');
  noSmooth();

  // 카드 형태 패널 - 테두리(틀)를 제거하고 배경과 같은 색으로 평평하게 표시
  noStroke();
  fill(245, 240, 226);
  rectMode(CENTER);
  rect(width / 2, height / 2, 450, 700, 16);
  rectMode(CORNER);

  // 내부 텍스트 스크롤 영역
  const centerX = width / 2;
  const panelTop = height / 2 - 350;
  const panelBottom = height / 2 + 350;

  // 클리핑 영역 설정 (카드 안에서만 글자 보이도록)
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(width / 2 - 220, panelTop + 30, 440, 640);
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
  if (!creditsFinished && contentBottomY + creditsScrollY < panelTop - 150) {
    creditsFinished = true;
  }

  drawingContext.restore();

  // 하단 안내 문구는 패널 아래쪽에 고정
  fill(0);
  textAlign(CENTER, TOP);

  // 크레딧 화면 오른쪽 하단에 쿠키 버튼 추가
  drawCookieButton(creditsRestartButton, hoveredButton === 'creditsRestart');

  // 다른 화면에 영향이 가지 않도록 부드러운 렌더링 복원
  smooth();
}

/* -----------------------------------------
   MICROPHONE UI (반응형)
----------------------------------------- */
function drawMicUI() {
  const panelW = 200;     // 고정 크기
  const panelH = 80;
  const panelX = width - panelW - 50;   // 오른쪽 아래
  const panelY = height - panelH - 50;

  const sx = panelX + 10;  // 슬라이더 X
  const sy = panelY + 38;  // 슬라이더 Y
  const sw = panelW - 20;  // 슬라이더 길이
  const sh = 5;            // 슬라이더 두께

  micSliderCfg.x = sx;
  micSliderCfg.y = sy;
  micSliderCfg.width = sw;
  micSliderCfg.height = sh;

  push();
  noStroke();

  /* 패널 배경 */
  fill(0, 0, 0, 150);
  rect(panelX, panelY, panelW, panelH, 8);

  /* 타이틀 */
  fill(255);
  textAlign(LEFT, TOP);
  textSize(10);
  text("MIC", panelX + 8, panelY + 5);

  /* 슬라이더 트랙 */
  fill(80);
  rect(sx, sy - sh/2, sw, sh, 3);

  /* 현재 마이크 레벨 (파란색) */
  let levelNorm = constrain((micLevel - micMin) / (micMax - micMin), 0, 1);
  let levelW = sw * levelNorm;
  fill(0, 180, 255, 200);
  rect(sx, sy - sh/2, levelW, sh, 3);

  /* 임계값 핸들 (노란색 점) */
  let thNorm = constrain((micThreshold - micMin) / (micMax - micMin), 0, 1);
  let handleX = sx + thNorm * sw;
  fill(255, 220, 0);
  circle(handleX, sy, 10);

  /* 수치 텍스트 */
  fill(220);
  textSize(10);
  textAlign(LEFT, TOP);
  text(`Lv:${micLevel.toFixed(3)} Th:${micThreshold.toFixed(3)}`, sx, panelY + 20);

  pop();
}

/* -----------------------------------------
   MIC SLIDER INTERACTIONS
----------------------------------------- */
function isMouseOnMicSlider(mx, my) {
  return mx >= micSliderCfg.x &&
         mx <= micSliderCfg.x + micSliderCfg.width &&
         my >= micSliderCfg.y - 10 &&
         my <= micSliderCfg.y + 10;
}

function updateMicThresholdByMouse(mx) {
  let sx = micSliderCfg.x;
  let sw = micSliderCfg.width;

  let t = constrain((mx - sx) / sw, 0, 1);
  micThreshold = micMin + t*(micMax-micMin);
}

/* -----------------------------------------
   INPUT
----------------------------------------- */
function mousePressed() {

  if (dmLogo && dmLogo._pos) {
    let p = dmLogo._pos;
    if (mouseX >= p.x && mouseX <= p.x + p.w &&
        mouseY >= p.y && mouseY <= p.y + p.h) {
      window.open("https://mediamba.ssu.ac.kr/", "_blank");
      return;
    }
  }

  if (isMouseOnMicSlider(mouseX, mouseY)) {
    micSliderCfg.dragging = true;
    updateMicThresholdByMouse(mouseX);
    return;
  }

  try { userStartAudio(); } catch(e){}

  if (gameState === 'start') {
    if (dist(mouseX, mouseY, startButton.x, startButton.y) < startButton.size/2)
      gameState='selectDifficulty';

    if (dist(mouseX, mouseY, rulesButton.x, rulesButton.y) < rulesButton.size/2) {
      currentRuleIndex = 0;
      gameState = 'rules';
    }
  }

  else if (gameState === 'rules') {
    if (mouseX < width/2) { if(currentRuleIndex>0) currentRuleIndex--; }
    else {
      if (currentRuleIndex === 3) gameState='selectDifficulty';
      else currentRuleIndex++;
    }
  }

  else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX, mouseY, easyButton)) { gameDifficulty='easy'; startGame(); }
    if (isInsideBtn(mouseX, mouseY, hardButton)) { gameDifficulty='hard'; startGame(); }
  }

  else if (['gameover','timeout'].includes(gameState)) {
    if (dist(mouseX, mouseY, restartButton.x, restartButton.y) < restartButton.size/2) {
      // 크레딧 시작 시 스크롤 상태 초기화
      gameState = 'credits';
      creditsScrollY = -200; // 텍스트가 더 위에서 시작하도록 설정
      creditsFinished = false;
    }
  }
  else if (gameState === 'success') {
    if (dist(mouseX, mouseY, successRestartButton.x, successRestartButton.y) < successRestartButton.size/2) {
      // 크레딧 시작 시 스크롤 상태 초기화
      gameState = 'credits';
      creditsScrollY = -200; // 텍스트가 더 위에서 시작하도록 설정
      creditsFinished = false;
    }
  }

  else if (gameState === 'credits') {
    if (dist(mouseX, mouseY, creditsRestartButton.x, creditsRestartButton.y) < creditsRestartButton.size/2) {
      gameState = 'start';
    }
  }
}

function mouseDragged() {
  if (micSliderCfg.dragging) updateMicThresholdByMouse(mouseX);
}

function mouseReleased() {
  micSliderCfg.dragging = false;
}

function mouseMoved() {
  if (!startButton || !rulesButton) return;
  hoveredButton = null;

  if (gameState === 'start') {
    if (dist(mouseX,mouseY,startButton.x,startButton.y) < startButton.size/2)
      hoveredButton='start';
    else if (dist(mouseX,mouseY,rulesButton.x,rulesButton.y) < rulesButton.size/2)
      hoveredButton='rules';
  }
  else if (gameState === 'selectDifficulty') {
    if (isInsideBtn(mouseX,mouseY,easyButton)) hoveredButton='easy';
    else if (isInsideBtn(mouseX,mouseY,hardButton)) hoveredButton='hard';
  }
  else if (gameState === 'rules') {
    if (mouseX < width/2) {
      if (currentRuleIndex>0) hoveredButton='prev';
    } else {
      if (currentRuleIndex===3) hoveredButton='startFromRule';
      else hoveredButton='next';
    }
  }
  else if (['gameover','timeout'].includes(gameState)) {
    if (dist(mouseX,mouseY,restartButton.x,restartButton.y) < restartButton.size/2)
      hoveredButton='restart';
  }
  else if (gameState === 'success') {
    if (dist(mouseX,mouseY,successRestartButton.x,successRestartButton.y) < successRestartButton.size/2)
      hoveredButton='restart';
  }
  else if (gameState === 'credits') {
    if (dist(mouseX, mouseY, creditsRestartButton.x, creditsRestartButton.y) < creditsRestartButton.size/2)
      hoveredButton='creditsRestart';
  }
}

/* -----------------------------------------
   KEYS
----------------------------------------- */
function keyPressed() {
  if (gameState === 'playing') snackGameKeyPressed(keyCode);
}

function keyReleased() {
  if (gameState === 'playing') snackGameKeyReleased(keyCode);
}

// 크레딧 화면에서 스페이스바 입력 처리 + 개발용 단축키
function keyTyped() {
  if (gameState === 'credits' && key === ' ') {
    gameState = 'start';
    return false;
  }
  
  // 개발용 단축키 (테스트용) - 게임 중에만 작동
  if (gameState === 'playing') {
    if (key === 's' || key === 'S') {
      // 's' 키: 바로 성공 화면으로
      score = 10;
      snackProgress = 10;
      gameState = 'success';
      if (typeof eduMusic !== 'undefined' && eduMusic && eduMusic.isPlaying()) eduMusic.stop();
      return false;
    } else if (key === 'f' || key === 'F') {
      // 'f' 키: 바로 실패 화면으로
      score = snackProgress;
      gameState = 'gameover';
      if (typeof eduMusic !== 'undefined' && eduMusic && eduMusic.isPlaying()) eduMusic.stop();
      return false;
    } else if (key === 't' || key === 'T') {
      // 't' 키: 바로 타임아웃 화면으로
      score = snackProgress;
      gameState = 'timeout';
      if (typeof eduMusic !== 'undefined' && eduMusic && eduMusic.isPlaying()) eduMusic.stop();
      return false;
    }
  }
}

/* -----------------------------------------
   UTIL
----------------------------------------- */
function startGame() {
  console.log("[SYSTEM] 게임 시작됨");
  gameState = 'playing';
  initSnackGame();
}

function isInsideBtn(px,py,btn) {
  return px > btn.x - btn.width/2 &&
         px < btn.x + btn.width/2 &&
         py > btn.y - btn.height/2 &&
         py < btn.y + btn.height/2;
}

function drawDMLogo() {
  let w = dmLogo.width * 1.1;
  let h = dmLogo.height * 1.1;

  let x = 10;
  let y = 10;

  imageMode(CORNER);
  image(dmLogo, x, y, w, h);

  // 클릭 영역 저장
  dmLogo._pos = {x, y, w, h};
}
