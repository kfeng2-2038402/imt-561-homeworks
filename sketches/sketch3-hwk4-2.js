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
    startPause: { x: 250, y: 705, w: 135, h: 44 },
    reset: { x: 415, y: 705, w: 135, h: 44 }
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.RADIANS);
    p.textFont("Arial");
    initializeObjects();
  };

  p.draw = function () {
    p.background(245, 238, 225);

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
    p.stroke(0);
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
    if (isFinished) {
      resetTimer();
    }
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
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      return;
    }

    if (isInsideButton(buttons.reset)) {
      resetTimer();
      return;
    }

    // Clicking the cup gives a tactile response only. It does not reset the timer.
    if (p.mouseX > 250 && p.mouseX < 550 && p.mouseY > 190 && p.mouseY < 580) {
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
    let cupY = 390;
    let cupW = 275;
    let cupH = 355;

    p.stroke(65);
    p.strokeWeight(4);
    p.fill(255, 248, 235, 245);
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

    let teaR = p.lerp(205, 230, progress);
    let teaG = p.lerp(155, 195, progress);
    let teaB = p.lerp(95, 150, progress);

    if (isFinished) {
      teaR = 235;
      teaG = 205;
      teaB = 160;
    }

    p.noStroke();
    p.fill(teaR, teaG, teaB, 190);
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

    p.fill(255, 236, 205, 115);
    p.ellipse(cupX, liquidTop + 16, cupW - 58, 24);

    drawIceCubes(cupX, cupY, cupW, cupH, liquidTop, liquidH, progress);
    drawBobas(cupX, cupY, progress);
    drawStraw(cupX, cupY, progress);

    p.noFill();
    p.stroke(65);
    p.strokeWeight(4);
    p.ellipse(cupX, cupY - cupH / 2, cupW + 10, 34);

    // Soft reflection only, not a progress line.
    p.stroke(255, 255, 255, 95);
    p.strokeWeight(4);
    p.line(cupX - 88, cupY - 138, cupX - 58, cupY + 95);
  }

  function drawIceCubes(cupX, cupY, cupW, cupH, liquidTop, liquidH, progress) {
    let melt = p.lerp(1, 0.35, progress);
    let alpha = p.lerp(220, 105, progress);

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

      p.stroke(110, 160, 190, alpha * 0.75);
      p.strokeWeight(2);
      p.fill(230, 245, 255, alpha);
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
      p.fill(45, 30, 25, 225);
      p.circle(x, y, b.size);

      p.fill(255, 255, 255, 55);
      p.circle(x - b.size * 0.18, y - b.size * 0.18, b.size * 0.25);
    }

    if (isFinished) {
      p.noStroke();
      p.fill(255, 220, 120, 150);
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
    let topY = 110;
    let bendX = cupX + 35;
    let bendY = cupY - 120;
    let bottomX = cupX + 10;
    let bottomY = cupY + 105;

    let shift = p.sin(progress * p.TWO_PI) * 8;

    p.stroke(80, 40, 50, 230);
    p.strokeWeight(16);
    p.line(topX + shift, topY, bendX + shift * 0.5, bendY);
    p.line(bendX + shift * 0.5, bendY, bottomX, bottomY);

    p.stroke(220, 95, 120, 240);
    p.strokeWeight(9);
    p.line(topX + shift, topY, bendX + shift * 0.5, bendY);
    p.line(bendX + shift * 0.5, bendY, bottomX, bottomY);
  }

  function drawInterface(remainingSeconds, progress) {
    let minutes = p.floor(remainingSeconds / 60);
    let seconds = p.floor(remainingSeconds % 60);

    p.noStroke();
    p.textAlign(p.CENTER);

    p.fill(50);
    p.textSize(36);
    p.text("Boba Focus Clock", p.width / 2, 48);

    p.textSize(16);
    p.fill(75);
    p.text(
      "A 25-minute focus timer with ambient drink-level progress",
      p.width / 2,
      80
    );

    drawStageLabel(progress);

    let barX = 220;
    let barY = 615;
    let barW = 360;
    let barH = 18;

    p.stroke(65);
    p.strokeWeight(2);
    p.fill(255, 248, 235);
    p.rect(barX, barY, barW, barH, 10);

    p.noStroke();
    p.fill(205, 155, 95);
    p.rect(barX, barY, barW * (1 - progress), barH, 10);

    p.stroke(40);
    p.strokeWeight(2);
    p.fill(255);
    p.rect(270, 645, 260, 44, 16);

    p.noStroke();
    p.fill(30);
    p.textSize(28);

    if (isFinished) {
      p.text("Done — break time", p.width / 2, 668);
    } else {
      p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2), p.width / 2, 668);
    }

    drawButton(buttons.startPause, isRunning ? "Pause" : "Start", true);
    drawButton(buttons.reset, "Reset", false);
  }

  function drawStageLabel(progress) {
    let label = "Full cup";
    if (isFinished) {
      label = "Break time";
    } else if (progress > 0.66) {
      label = "Almost done";
    } else if (progress > 0.33) {
      label = "In flow";
    } else if (progress > 0) {
      label = "Starting";
    }

    p.stroke(55);
    p.strokeWeight(1.5);
    p.fill(255, 250, 240);
    p.rect(315, 92, 170, 32, 16);

    p.noStroke();
    p.fill(45);
    p.textSize(15);
    p.text(label, p.width / 2, 109);
  }

  function drawButton(btn, label, primary) {
    let hover = isInsideButton(btn);

    p.noStroke();
    p.fill(0, 0, 0, hover ? 35 : 22);
    p.rect(btn.x + 2, btn.y + 3, btn.w, btn.h, 16);

    if (primary) {
      p.fill(hover ? p.color(38, 38, 52) : p.color(28, 28, 42));
    } else {
      p.fill(hover ? p.color(255, 255, 255) : p.color(248, 244, 236));
    }

    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.stroke(primary ? p.color(28, 28, 42) : p.color(45, 38, 32));
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(17);
    p.fill(primary ? 255 : 35);
    p.text(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});