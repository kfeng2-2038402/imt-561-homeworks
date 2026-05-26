registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const SESSION_LENGTH = 25 * 60 * 1000;

  let elapsedBeforePause = 0;
  let startMillis = 0;
  let isRunning = false;
  let isFinished = false;

  const buttons = {
    startPause: { x: 250, y: 722, w: 140, h: 42 },
    reset: { x: 410, y: 722, w: 140, h: 42 }
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.DEGREES);
    p.textFont("Arial");
  };

  p.draw = function () {
    let elapsed = getElapsedTime();
    let progress = p.constrain(elapsed / SESSION_LENGTH, 0, 1);
    let remainingMs = p.max(SESSION_LENGTH - elapsed, 0);

    if (progress >= 1 && isRunning) {
      isRunning = false;
      isFinished = true;
      elapsedBeforePause = SESSION_LENGTH;
    }

    drawRoomBackground(progress);

    let winX = 190;
    let winY = 65;
    let winW = 420;
    let winH = 420;

    drawWindow(winX, winY, winW, winH, progress);
    drawInterface(progress, remainingMs);

    p.noFill();
    p.stroke(110, 98, 92);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function getElapsedTime() {
    if (isRunning) {
      return elapsedBeforePause + (p.millis() - startMillis);
    }
    return elapsedBeforePause;
  }

  function startTimer() {
    if (isFinished) resetTimer();
    isRunning = true;
    startMillis = p.millis();
  }

  function pauseTimer() {
    elapsedBeforePause = getElapsedTime();
    isRunning = false;
  }

  function resetTimer() {
    elapsedBeforePause = 0;
    startMillis = p.millis();
    isRunning = false;
    isFinished = false;
  }

  p.mousePressed = function () {
    if (isInsideButton(buttons.startPause)) {
      if (isRunning) pauseTimer();
      else startTimer();
      return;
    }

    if (isInsideButton(buttons.reset)) {
      resetTimer();
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

  function drawWindow(x, y, w, h, progress) {
    p.noStroke();
    p.fill(96, 72, 88, 24);
    p.rect(x - 24, y - 20, w + 60, h + 58, 14);

    p.noFill();
    p.stroke(54, 49, 70);
    p.strokeWeight(8);
    p.rect(x - 30, y - 30, w + 60, h + 60, 10);

    p.strokeWeight(3);
    p.rect(x, y, w, h, 5);

    drawSkyGradient(x, y, w, h, progress);
    drawFogAndClarity(x, y, w, h, progress);
    drawHighContrastSunPath(x, y, w, h, progress);

    p.noFill();
    p.stroke(54, 49, 70);
    p.strokeWeight(4);
    p.rect(x, y, w, h, 5);
  }

  function drawRoomBackground(progress) {
    let topColor = p.lerpColor(
      p.color(248, 244, 236),
      p.color(230, 235, 246),
      progress
    );

    let bottomColor = p.lerpColor(
      p.color(237, 228, 216),
      p.color(220, 224, 238),
      progress
    );

    for (let i = 0; i < p.height; i++) {
      let t = i / p.height;
      let c = p.lerpColor(topColor, bottomColor, t);
      p.stroke(c);
      p.line(0, i, p.width, i);
    }
  }

  function drawSkyGradient(x, y, w, h, progress) {
    let top = p.lerpColor(
      p.color(176, 196, 222),
      p.color(116, 141, 202),
      progress
    );

    let middle = p.lerpColor(
      p.color(226, 229, 225),
      p.color(255, 218, 165),
      progress
    );

    let bottom = p.lerpColor(
      p.color(240, 231, 218),
      p.color(210, 132, 146),
      progress
    );

    if (isFinished) {
      top = p.color(255, 232, 172);
      middle = p.color(255, 196, 132);
      bottom = p.color(216, 135, 145);
    }

    for (let i = 0; i < h; i++) {
      let t = i / h;
      let c;

      if (t < 0.55) {
        c = p.lerpColor(top, middle, p.map(t, 0, 0.55, 0, 1));
      } else {
        c = p.lerpColor(middle, bottom, p.map(t, 0.55, 1, 0, 1));
      }

      p.stroke(c);
      p.line(x, y + i, x + w, y + i);
    }
  }

  function drawFogAndClarity(x, y, w, h, progress) {
    let fogAlpha = p.lerp(210, 22, progress);
    let clearWidth = p.lerp(70, 330, progress);

    if (isFinished) {
      fogAlpha = 0;
      clearWidth = 350;
    }

    p.noStroke();

    p.fill(255, 252, 245, fogAlpha * 0.48);
    p.ellipse(x + w * 0.50, y + h * 0.33, w * 0.9, 95);
    p.ellipse(x + w * 0.40, y + h * 0.43, w * 0.76, 72);
    p.ellipse(x + w * 0.62, y + h * 0.50, w * 0.78, 78);

    p.fill(255, 236, 190, p.lerp(20, 88, progress));
    p.ellipse(x + w * 0.5, y + h * 0.45, clearWidth, h * 0.34);

    let endWarmth = p.constrain(p.map(progress, 0.75, 1, 0, 1), 0, 1);
    p.fill(255, 184, 132, endWarmth * 72);
    p.ellipse(x + w * 0.5, y + h * 0.80, w * 0.95, h * 0.24);
  }

  function drawHighContrastSunPath(winX, winY, winW, winH, progress) {
    let x1 = winX + winW - 55;
    let y1 = winY + 75;

    let cx1 = winX + winW - 10;
    let cy1 = winY + 205;

    let cx2 = winX + 175;
    let cy2 = winY + 250;

    let x2 = winX + 65;
    let y2 = winY + winH - 90;

    p.noFill();
    p.stroke(54, 49, 70, 240);
    p.strokeWeight(7);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    p.stroke(255, 239, 185, 240);
    p.strokeWeight(3);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    let steps = 10;
    let activeIndex = p.round(progress * (steps - 1));
    activeIndex = p.constrain(activeIndex, 0, steps - 1);

    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let sx = p.bezierPoint(x1, cx1, cx2, x2, t);
      let sy = p.bezierPoint(y1, cy1, cy2, y2, t);

      if (i === activeIndex) {
        drawSun(sx, sy, 42, true);
      } else {
        drawSun(sx, sy, 18, false);
      }
    }
  }

  function drawSun(x, y, size, active) {
    if (active) {
      p.noStroke();
      p.fill(255, 215, 102, 125);
      p.circle(x, y, size * 2.8);

      p.stroke(86, 65, 70);
      p.strokeWeight(2);
      for (let i = 0; i < 12; i++) {
        let a = i * 30 + p.frameCount * 0.22;
        p.line(
          x + p.cos(a) * size * 0.75,
          y + p.sin(a) * size * 0.75,
          x + p.cos(a) * size * 1.2,
          y + p.sin(a) * size * 1.2
        );
      }

      p.fill(255, 208, 82);
      p.stroke(86, 65, 70);
      p.strokeWeight(3);
      p.circle(x, y, size);
    } else {
      p.fill(255, 232, 145);
      p.stroke(86, 65, 70);
      p.strokeWeight(2);
      p.circle(x, y, size);
    }
  }

  function drawInterface(progress, remainingMs) {
    let minutes = p.floor(remainingMs / 60000);
    let seconds = p.floor((remainingMs % 60000) / 1000);

    p.noStroke();
    p.fill(255, 250, 242, 228);
    p.rect(175, 565, 450, 210, 24);

    p.stroke(88, 70, 84, 38);
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(175, 565, 450, 210, 24);

    p.noStroke();
    p.fill(48, 43, 60);
    p.textAlign(p.CENTER);
    p.textSize(34);
    p.text("Focus Window Clock", p.width / 2, 608);

    p.textSize(14);
    p.fill(92, 80, 92);
    p.text(
      "A 25-minute ambient focus guide for low-energy indoor study",
      p.width / 2,
      635
    );

    p.stroke(70, 60, 80);
    p.strokeWeight(2);
    p.fill(255, 253, 248);
    p.rect(290, 660, 220, 46, 20);

    p.noStroke();
    p.fill(48, 43, 60);
    p.textSize(26);

    if (isFinished) {
      p.text("Break time", p.width / 2, 684);
    } else {
      p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2), p.width / 2, 684);
    }

    drawButton(buttons.startPause, isRunning ? "Pause" : "Start", true);
    drawButton(buttons.reset, "Reset", false);
  }

  function drawButton(btn, label, primary) {
    let hover = isInsideButton(btn);

    p.noStroke();
    p.fill(60, 45, 70, hover ? 34 : 22);
    p.rect(btn.x + 2, btn.y + 3, btn.w, btn.h, 16);

    if (primary) {
      p.fill(hover ? p.color(82, 73, 112) : p.color(65, 58, 92));
    } else {
      p.fill(hover ? p.color(255, 255, 255) : p.color(250, 246, 238));
    }

    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.stroke(primary ? p.color(65, 58, 92) : p.color(95, 82, 92));
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(btn.x, btn.y, btn.w, btn.h, 16);

    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(17);
    p.fill(primary ? 255 : p.color(58, 51, 66));
    p.text(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});