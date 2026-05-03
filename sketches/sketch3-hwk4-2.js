// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const CANVAS_W = 500;
  const CANVAS_H = 600;

  let totalMinutes = 25;
  let totalSeconds = totalMinutes * 60;
  let startTime;

  let lastMinute = -1;
  let stirStartTime = 0;
  let isStirring = false;

  let bobas = [];

  p.setup = function () {
    p.createCanvas(CANVAS_W, CANVAS_H);
    initializeTimer();
  };

  p.draw = function () {
    p.background(245, 238, 225);

    let elapsedSeconds = (p.millis() - startTime) / 1000;
    let elapsedMinutes = p.floor(elapsedSeconds / 60);
    let remainingSeconds = p.max(totalSeconds - elapsedSeconds, 0);
    let remainingMinutes = p.ceil(remainingSeconds / 60);

    if (elapsedMinutes !== lastMinute && elapsedMinutes > 0 && elapsedMinutes <= totalMinutes) {
      lastMinute = elapsedMinutes;
      stirStartTime = p.millis();
      isStirring = true;
    }

    if (p.millis() - stirStartTime > 900) {
      isStirring = false;
    }

    let progress = p.constrain(elapsedSeconds / totalSeconds, 0, 1);

    drawBobaCup(progress, remainingMinutes);
    drawText(remainingSeconds);
  };

  p.mousePressed = function () {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      initializeTimer();
    }
  };

  function initializeTimer() {
    startTime = p.millis();
    lastMinute = -1;
    stirStartTime = 0;
    isStirring = false;
    bobas = [];

    for (let i = 0; i < totalMinutes; i++) {
      bobas.push({
        x: p.random(-75, 75),
        y: p.random(55, 130),
        size: p.random(16, 22),
        phase: p.random(p.TWO_PI)
      });
    }
  }

  function drawBobaCup(progress, remainingMinutes) {
    let cupX = p.width / 2;
    let cupY = 320;
    let cupW = 220;
    let cupH = 300;

    p.stroke(80);
    p.strokeWeight(3);
    p.fill(255, 248, 235);
    p.quad(
      cupX - cupW / 2, cupY - cupH / 2,
      cupX + cupW / 2, cupY - cupH / 2,
      cupX + cupW / 2 - 30, cupY + cupH / 2,
      cupX - cupW / 2 + 30, cupY + cupH / 2
    );

    let liquidH = p.map(progress, 0, 1, cupH - 35, 18);
    let liquidTop = cupY + cupH / 2 - liquidH;

    p.noStroke();
    p.fill(210, 165, 105, 135);
    p.quad(
      cupX - cupW / 2 + 12, liquidTop,
      cupX + cupW / 2 - 12, liquidTop,
      cupX + cupW / 2 - 38, cupY + cupH / 2 - 10,
      cupX - cupW / 2 + 38, cupY + cupH / 2 - 10
    );

    p.fill(255, 235, 200, 60);
    p.ellipse(cupX, liquidTop + 15, cupW - 45, 18);

    p.fill(45, 30, 25, 220);

    let visibleBobaCount = p.constrain(remainingMinutes, 0, totalMinutes);

    for (let i = 0; i < visibleBobaCount; i++) {
      let b = bobas[i];

      let moveX = 0;
      let moveY = 0;

      if (isStirring) {
        let t = (p.millis() - stirStartTime) / 900;
        let ease = p.sin(t * p.PI);
        moveX = p.sin(t * p.TWO_PI + b.phase) * 6 * ease;
        moveY = p.cos(t * p.TWO_PI + b.phase) * 4 * ease;
      }

      let bx = cupX + b.x + moveX;
      let by = cupY + b.y + moveY;

      bx = p.constrain(bx, cupX - 78, cupX + 78);
      by = p.constrain(by, cupY + 45, cupY + 132);

      p.circle(bx, by, b.size);
    }

    p.stroke(180, 80, 90, 230);
    p.strokeWeight(12);

    let baseAngle = -0.15;
    let stirAngle = 0;
    let verticalMove = 0;

    if (isStirring) {
      let t = (p.millis() - stirStartTime) / 900;
      let ease = p.sin(t * p.PI);
      stirAngle = p.sin(t * p.TWO_PI) * 0.12 * ease;
      verticalMove = p.sin(t * p.TWO_PI) * 7 * ease;
    }

    let angle = baseAngle + stirAngle;

    let bendX = cupX + 25 + p.sin(angle) * 20;
    let bendY = cupY - 75 + verticalMove;

    let topX = bendX - 45 + p.sin(angle) * 40;
    let topY = 90 + verticalMove;

    let bottomX = cupX + 10 + p.sin(angle) * 35;
    let bottomY = cupY + 75 + verticalMove * 0.4;

    p.line(topX, topY, bendX, bendY);
    p.line(bendX, bendY, bottomX, bottomY);

    if (isStirring) {
      p.noFill();
      p.stroke(255, 235, 205, 110);
      p.strokeWeight(2);

      let t = (p.millis() - stirStartTime) / 900;

      for (let i = 0; i < 2; i++) {
        p.arc(
          cupX,
          cupY + 70 + i * 22,
          70 + i * 20,
          18,
          t * p.TWO_PI + i,
          t * p.TWO_PI + p.PI + i
        );
      }
    }

    p.stroke(255, 255, 255, 120);
    p.strokeWeight(4);
    p.line(cupX - 65, cupY - 120, cupX - 45, cupY + 90);
  }

  function drawText(remainingSeconds) {
    let minutes = p.floor(remainingSeconds / 60);
    let seconds = p.floor(remainingSeconds % 60);

    p.fill(60);
    p.noStroke();
    p.textAlign(p.CENTER);

    p.textSize(24);
    p.text("Boba Focus Clock", p.width / 2, 50);

    p.textSize(16);
    p.text("The liquid slowly decreases, and boba moves once each minute.", p.width / 2, 80);

    p.textSize(16);
    p.text("Click the canvas to restart.", p.width / 2, 105);

    p.textSize(28);
    p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2), p.width / 2, 540);
  }
});