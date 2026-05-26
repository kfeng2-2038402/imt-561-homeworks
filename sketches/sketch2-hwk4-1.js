registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const SESSION_LENGTH = 25 * 60 * 1000; // 25-minute focus session

  let elapsedBeforePause = 0;
  let startMillis = 0;
  let isRunning = false;
  let isFinished = false;

  const buttons = {
    startPause: { x: 250, y: 710, w: 135, h: 44 },
    reset: { x: 415, y: 710, w: 135, h: 44 }
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
    let winY = 90;
    let winW = 420;
    let winH = 420;

    drawWindow(winX, winY, winW, winH, progress);
    drawInterface(progress, remainingMs);

    // Canvas border
    p.noFill();
    p.stroke(0);
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
    if (isFinished) {
      resetTimer();
    }
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
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
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
    // Outer frame
    p.noFill();
    p.stroke(25);
    p.strokeWeight(8);
    p.rect(x - 30, y - 30, w + 60, h + 60, 8);

    // Inner frame
    p.strokeWeight(3);
    p.rect(x, y, w, h, 4);

    drawSkyGradient(x, y, w, h, progress);
    drawFogAndClarity(x, y, w, h, progress);
    drawHighContrastSunPath(x, y, w, h, progress);
  }

  function drawRoomBackground(progress) {
    let topColor = p.lerpColor(
      p.color(238, 238, 232),
      p.color(224, 231, 244),
      progress
    );

    let bottomColor = p.lerpColor(
      p.color(224, 218, 208),
      p.color(205, 214, 232),
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
    // Starts foggy and low-energy, then becomes warmer and clearer
    let top = p.lerpColor(
      p.color(180, 192, 205),
      p.color(88, 126, 205),
      progress
    );

    let middle = p.lerpColor(
      p.color(222, 226, 224),
      p.color(255, 208, 130),
      progress
    );

    let bottom = p.lerpColor(
      p.color(236, 232, 220),
      p.color(160, 82, 115),
      progress
    );

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
    let fogAlpha = p.lerp(220, 25, progress);
    let clearWidth = p.lerp(70, 330, progress);

    p.noStroke();

    // Fog layers at beginning
    p.fill(255, 255, 255, fogAlpha * 0.48);
    p.ellipse(x + w * 0.50, y + h * 0.33, w * 0.9, 95);
    p.ellipse(x + w * 0.40, y + h * 0.43, w * 0.76, 72);
    p.ellipse(x + w * 0.62, y + h * 0.50, w * 0.78, 78);

    // Clearing center light
    p.fill(255, 240, 190, p.lerp(20, 90, progress));
    p.ellipse(x + w * 0.5, y + h * 0.45, clearWidth, h * 0.34);

    // Warm break cue near the end
    let endWarmth = p.constrain(p.map(progress, 0.75, 1, 0, 1), 0, 1);
    p.fill(255, 190, 130, endWarmth * 60);
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

    // High contrast path outline
    p.noFill();
    p.stroke(30, 30, 45, 230);
    p.strokeWeight(7);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    // Light inner line
    p.stroke(255, 245, 190, 235);
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
      // Glow
      p.noStroke();
      p.fill(255, 220, 80, 120);
      p.circle(x, y, size * 2.8);

      // Rays
      p.stroke(45);
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

      p.fill(255, 215, 70);
      p.stroke(45);
      p.strokeWeight(3);
      p.circle(x, y, size);
    } else {
      p.fill(255, 238, 160);
      p.stroke(45);
      p.strokeWeight(2);
      p.circle(x, y, size);
    }
  }

  function drawInterface(progress, remainingMs) {
    let minutes = p.floor(remainingMs / 60000);
    let seconds = p.floor((remainingMs % 60000) / 1000);

    p.noStroke();
    p.fill(25);
    p.textAlign(p.CENTER);

    p.textSize(42);
    p.text("Focus Window Clock", p.width / 2, 625);

    p.textSize(16);
    p.fill(65);
    p.text(
      "A 25-minute ambient focus guide for low-energy indoor study sessions",
      p.width / 2,
      657
    );

    // High contrast time pill
    p.stroke(40);
    p.strokeWeight(2);
    p.fill(255);
    p.rect(270, 672, 260, 40, 15);

    p.noStroke();
    p.fill(30);
    p.textSize(24);

    if (isFinished) {
      p.text("Break time", p.width / 2, 692);
    } else {
      p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2) + " remaining", p.width / 2, 692);
    }

    drawButton(buttons.startPause, isRunning ? "Pause" : "Start");
    drawButton(buttons.reset, "Reset");
  }

  function drawButton(btn, label) {
    let hover = isInsideButton(btn);

    p.stroke(35);
    p.strokeWeight(2);
    p.fill(hover ? 255 : 245);
    p.rect(btn.x, btn.y, btn.w, btn.h, 12);

    p.noStroke();
    p.fill(30);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.text(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});