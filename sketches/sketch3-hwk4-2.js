registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  const TOTAL_SECONDS = 25 * 60;

  let elapsedBeforePause = 0;
  let startMillis = 0;
  let isRunning = false;
  let isFinished = false;

  let bobas = [];
  let iceCubes = [];
  let shake = 0;

  const buttons = {
    startPause: { x: 250, y: 720, w: 135, h: 42 },
    reset: { x: 415, y: 720, w: 135, h: 42 }
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.RADIANS);
    p.textFont("Arial");
    initializeObjects();
  };

  p.draw = function () {
    p.background(250, 242, 230);

    let elapsed = getElapsedSeconds();
    let progress = p.constrain(elapsed / TOTAL_SECONDS, 0, 1);
    let remaining = p.max(TOTAL_SECONDS - elapsed, 0);

    if (progress >= 1 && isRunning) {
      isRunning = false;
      isFinished = true;
      elapsedBeforePause = TOTAL_SECONDS;
    }

    if (shake > 0) {
      shake *= 0.88;
    }

    let offsetX = p.random(-shake, shake);

    p.push();
    p.translate(offsetX, 0);
    drawBobaCup(progress);
    p.pop();

    drawInterface(remaining, progress);

    p.noFill();
    p.stroke(126, 96, 78);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function getElapsedSeconds() {
    if (isRunning) {
      return elapsedBeforePause + (p.millis() - startMillis) / 1000;
    }
    return elapsedBeforePause;
  }

  function startTimer() {
    if (isFinished) resetTimer();
    isRunning = true;
    startMillis = p.millis();
  }

  function pauseTimer() {
    elapsedBeforePause = getElapsedSeconds();
    isRunning = false;
  }

  function resetTimer() {
    elapsedBeforePause = 0;
    startMillis = p.millis();
    isRunning = false;
    isFinished = false;
    initializeObjects();
  }

  p.mousePressed = function () {
    if (isInsideButton(buttons.startPause)) {
      if (isRunning) pauseTimer();
      else startTimer();
      return;
    }

    if (isInsideButton(buttons.reset)) {
      resetTimer();
      return;
    }

    if (p.mouseX > 250 && p.mouseX < 550 && p.mouseY > 160 && p.mouseY < 560) {
      shake = 8;
    }
  };

  function isInsideButton(btn) {
    return (
      p.mouseX >= btn.x &&
      p.mouseX <= btn.x + btn.w &&
      p.mouseY >= btn.y &&
      p.mouseY <= btn.y + btn.h
    );
  }

  function initializeObjects() {
    bobas = [];
    iceCubes = [];

    for (let i = 0; i < 25; i++) {
      bobas.push({
        x: p.random(-90, 90),
        y: p.random(75, 150),
        size: p.random(17, 23),
        phase: p.random(p.TWO_PI)
      });
    }

    for (let i = 0; i < 6; i++) {
      iceCubes.push({
        x: p.random(-70, 70),
        yFactor: p.random(0.12, 0.65),
        size: p.random(34, 48),
        angle: p.random(-0.35, 0.35),
        phase: p.random(p.TWO_PI)
      });
    }
  }

  function drawBobaCup(progress) {
    let cupX = p.width / 2;
    let cupY = 350;
    let cupW = 275;
    let cupH = 330;

    p.stroke(92, 65, 52);
    p.strokeWeight(4);
    p.fill(255, 249, 238, 245);
    p.quad(
      cupX - cupW / 2,
      cupY - cupH / 2,
      cupX + cupW / 2,
      cupY - cupH / 2,
      cupX + cupW / 2 - 35,
      cupY + cupH / 2,
      cupX - cupW / 2 + 35,
      cupY + cupH / 2
    );

    let liquidH = p.map(progress, 0, 1, cupH - 38, 35);
    let liquidTop = cupY + cupH / 2 - liquidH;

    let teaR = p.lerp(204, 232, progress);
    let teaG = p.lerp(149, 196, progress);
    let teaB = p.lerp(92, 145, progress);

    if (isFinished) {
      teaR = 235;
      teaG = 205;
      teaB = 160;
    }

    p.noStroke();
    p.fill(teaR, teaG, teaB, 192);
    p.quad(
      cupX - cupW / 2 + 16,
      liquidTop,
      cupX + cupW / 2 - 16,
      liquidTop,
      cupX + cupW / 2 - 43,
      cupY + cupH / 2 - 14,
      cupX - cupW / 2 + 43,
      cupY + cupH / 2 - 14
    );

    p.fill(255, 237, 210, 125);
    p.ellipse(cupX, liquidTop + 16, cupW - 58, 24);

    drawIceCubes(cupX, cupY, cupW, cupH, liquidTop, liquidH, progress);
    drawBobas(cupX, cupY, progress);
    drawStraw(cupX, cupY, progress);

    p.noFill();
    p.stroke(92, 65, 52);
    p.strokeWeight(4);
    p.ellipse(cupX, cupY - cupH / 2, cupW + 10, 34);

    p.stroke(255, 255, 255, 100);
    p.strokeWeight(4);
    p.line(cupX - 88, cupY - 126, cupX - 58, cupY + 82);
  }

  function drawIceCubes(cupX, cupY, cupW, cupH, liquidTop, liquidH, progress) {
    let melt = p.lerp(1, 0.35, progress);
    let alpha = p.lerp(215, 105, progress);

    let topBound = liquidTop + 35;
    let bottomBound = p.min(cupY + cupH / 2 - 105, liquidTop + liquidH * 0.5);

    if (bottomBound < topBound) {
      bottomBound = topBound + 8;
    }

    for (let i = 0; i < iceCubes.length; i++) {
      let ice = iceCubes[i];

      let x = cupX + ice.x + p.sin(p.frameCount * 0.015 + ice.phase) * 2;
      let y = p.lerp(topBound, bottomBound, ice.yFactor);
      let size = ice.size * melt;

      x = p.constrain(x, cupX - 85, cupX + 85);
      y = p.constrain(y, topBound, bottomBound + 5);

      p.push();
      p.translate(x, y);
      p.rotate(ice.angle + p.sin(p.frameCount * 0.01 + ice.phase) * 0.03);
      p.rectMode(p.CENTER);

      p.stroke(130, 165, 185, alpha * 0.72);
      p.strokeWeight(2);
      p.fill(235, 247, 255, alpha);
      p.rect(0, 0, size, size, 7);

      p.noStroke();
      p.fill(255, 255, 255, alpha * 0.65);
      p.rect(-size * 0.14, -size * 0.16, size * 0.28, size * 0.16, 3);

      p.pop();
    }
  }

  function drawBobas(cupX, cupY, progress) {
    let visibleCount = p.ceil(p.map(1 - progress, 0, 1, 0, bobas.length));
    visibleCount = p.constrain(visibleCount, 0, bobas.length);

    for (let i = 0; i < visibleCount; i++) {
      let b = bobas[i];

      let x = cupX + b.x + p.sin(p.frameCount * 0.012 + b.phase) * 1.2;
      let y = cupY + b.y + p.cos(p.frameCount * 0.011 + b.phase) * 1.0;

      p.noStroke();
      p.fill(55, 35, 28, 230);
      p.circle(x, y, b.size);

      p.fill(255, 255, 255, 58);
      p.circle(x - b.size * 0.18, y - b.size * 0.18, b.size * 0.25);
    }

    if (isFinished) {
      p.noStroke();
      p.fill(255, 218, 128, 150);
      for (let i = 0; i < 8; i++) {
        let angle = (p.TWO_PI / 8) * i + p.frameCount * 0.01;
        let x = cupX + p.cos(angle) * 115;
        let y = cupY - 40 + p.sin(angle) * 45;
        p.circle(x, y, 5);
      }
    }
  }

  function drawStraw(cupX, cupY, progress) {
    let topX = cupX - 45;
    let topY = 95;
    let bendX = cupX + 35;
    let bendY = cupY - 112;
    let bottomX = cupX + 10;
    let bottomY = cupY + 96;

    let shift = p.sin(progress * p.TWO_PI) * 8;

    p.stroke(110, 62, 76, 230);
    p.strokeWeight(16);
    p.line(topX + shift, topY, bendX + shift * 0.5, bendY);
    p.line(bendX + shift * 0.5, bendY, bottomX, bottomY);

    p.stroke(214, 112, 138, 242);
    p.strokeWeight(9);
    p.line(topX + shift, topY, bendX + shift * 0.5, bendY);
    p.line(bendX + shift * 0.5, bendY, bottomX, bottomY);
  }

  function drawInterface(remainingSeconds, progress) {
    let minutes = p.floor(remainingSeconds / 60);
    let seconds = p.floor(remainingSeconds % 60);

    p.noStroke();
    p.textAlign(p.CENTER);

    p.fill(74, 50, 38);
    p.textSize(36);
    p.text("Boba Focus Clock", p.width / 2, 48);

    p.textSize(16);
    p.fill(112, 82, 64);
    p.text(
      "A 25-minute focus timer with ambient drink-level progress",
      p.width / 2,
      80
    );

    p.noStroke();
    p.fill(255, 250, 240, 230);
    p.rect(170, 595, 460, 185, 24);

    p.stroke(120, 86, 65, 38);
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(170, 595, 460, 185, 24);

    let barX = 220;
    let barY = 618;
    let barW = 360;
    let barH = 18;

    p.stroke(105, 70, 52);
    p.strokeWeight(2);
    p.fill(255, 248, 235);
    p.rect(barX, barY, barW, barH, 10);

    p.noStroke();
    p.fill(198, 139, 82);
    p.rect(barX, barY, barW * (1 - progress), barH, 10);

    p.stroke(105, 70, 52);
    p.strokeWeight(2);
    p.fill(255, 253, 248);
    p.rect(270, 650, 260, 46, 18);

    p.noStroke();
    p.fill(74, 50, 38);
    p.textSize(28);

    if (isFinished) {
      p.text("Break time", p.width / 2, 674);
    } else {
      p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2), p.width / 2, 674);
    }

    drawButton(buttons.startPause, isRunning ? "Pause" : "Start", true);
    drawButton(buttons.reset, "Reset", false);
  }

  function drawButton(btn, label, primary) {
    let hover = isInsideButton(btn);

    p.noStroke();
    p.fill(80, 50, 36, hover ? 34 : 22);
    p.rect(btn.x + 2, btn.y + 3, btn.w, btn.h, 16);

    if (primary) {
      p.fill(hover ? p.color(126, 83, 60) : p.color(105, 70, 52));
    } else {
      p.fill(hover ? p.color(255, 255, 255) : p.color(250, 244, 236));
    }

    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.stroke(primary ? p.color(105, 70, 52) : p.color(120, 88, 68));
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(17);
    p.fill(primary ? 255 : p.color(84, 58, 44));
    p.text(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});