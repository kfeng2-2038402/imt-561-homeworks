registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;

  let totalMinutes = 25;
  let totalSeconds = totalMinutes * 60;
  let startTime;

  let lastMinute = -1;
  let stirStartTime = 0;
  let isStirring = false;

  let bobas = [];
  let iceCubes = [];

  const STIR_DURATION = 1800; // slower and softer stir

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.RADIANS);
    p.textFont("Arial");
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

    if (p.millis() - stirStartTime > STIR_DURATION) {
      isStirring = false;
    }

    let progress = p.constrain(elapsedSeconds / totalSeconds, 0, 1);

    drawBobaCup(progress, remainingMinutes);
    drawText(remainingSeconds);

    // canvas border
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
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
    iceCubes = [];

    // boba positions
    for (let i = 0; i < totalMinutes; i++) {
      bobas.push({
        x: p.random(-90, 90),
        y: p.random(65, 150),
        size: p.random(18, 24),
        phase: p.random(p.TWO_PI)
      });
    }

    // floating ice cubes
    for (let i = 0; i < 6; i++) {
      iceCubes.push({
        x: p.random(-65, 65),
        yFactor: p.random(0.08, 0.82), // relative position inside upper liquid band
        baseSize: p.random(38, 52),
        angle: p.random(-0.4, 0.4),
        phase: p.random(p.TWO_PI),
        dir: p.random() > 0.5 ? 1 : -1
      });
    }
  }

  function drawBobaCup(progress, remainingMinutes) {
    let cupX = p.width / 2;
    let cupY = 390;
    let cupW = 270;
    let cupH = 360;

    // cup
    p.stroke(80);
    p.strokeWeight(3);
    p.fill(255, 248, 235);
    p.quad(
      cupX - cupW / 2, cupY - cupH / 2,
      cupX + cupW / 2, cupY - cupH / 2,
      cupX + cupW / 2 - 35, cupY + cupH / 2,
      cupX - cupW / 2 + 35, cupY + cupH / 2
    );

    // liquid level
    let liquidH = p.map(progress, 0, 1, cupH - 40, 24);
    let liquidTop = cupY + cupH / 2 - liquidH;

    // tea gets lighter over time
    let teaR = p.lerp(210, 228, progress);
    let teaG = p.lerp(165, 192, progress);
    let teaB = p.lerp(105, 150, progress);
    let teaAlpha = p.lerp(145, 95, progress);

    p.noStroke();
    p.fill(teaR, teaG, teaB, teaAlpha);
    p.quad(
      cupX - cupW / 2 + 14, liquidTop,
      cupX + cupW / 2 - 14, liquidTop,
      cupX + cupW / 2 - 42, cupY + cupH / 2 - 12,
      cupX - cupW / 2 + 42, cupY + cupH / 2 - 12
    );

    // liquid surface highlight
    p.fill(255, 235, 200, 70);
    p.ellipse(cupX, liquidTop + 18, cupW - 55, 22);

    // ---------------- ice cubes ----------------
    // keep ice cubes in the upper/middle portion of the remaining liquid
    let iceBandTop = p.max(liquidTop + 28, cupY - cupH / 2 + 88);
    let iceBandBottom = p.min(cupY + cupH / 2 - 122, liquidTop + liquidH * 0.48);

    if (iceBandBottom < iceBandTop + 10) {
      iceBandBottom = iceBandTop + 10;
    }

    // melt as drink is consumed
    let meltFactor = p.lerp(1.0, 0.35, progress);
    let iceAlpha = p.lerp(230, 120, progress);

    let icePositions = [];

    for (let i = 0; i < iceCubes.length; i++) {
      let ice = iceCubes[i];

      // gentle floating motion
      let floatX = p.sin(p.frameCount * 0.022 + ice.phase) * 2.4;
      let floatY = p.cos(p.frameCount * 0.018 + ice.phase) * 1.8;
      let floatRotate = p.sin(p.frameCount * 0.015 + ice.phase) * 0.05;

      let moveX = 0;
      let moveY = 0;
      let rotateOffset = 0;

      // gentle stirring motion every minute
      if (isStirring) {
        let t = (p.millis() - stirStartTime) / STIR_DURATION;
        t = p.constrain(t, 0, 1);
        let ease = p.sin(t * p.PI);

        moveX = p.sin(t * p.TWO_PI * 0.9 + ice.phase) * 7.5 * ease * ice.dir;
        moveY = p.cos(t * p.TWO_PI * 0.8 + ice.phase) * 4.0 * ease;
        rotateOffset = p.sin(t * p.TWO_PI * 0.9 + ice.phase) * 0.16 * ease;
      }

      let baseY = p.lerp(iceBandTop, iceBandBottom, ice.yFactor);
      let sizeNow = ice.baseSize * meltFactor;

      let ix = cupX + ice.x + floatX + moveX;
      let iy = baseY + floatY + moveY;

      icePositions.push({
        x: ix,
        y: iy,
        size: sizeNow,
        angle: ice.angle + floatRotate + rotateOffset,
        alpha: iceAlpha
      });
    }

    // soft collision feel during stirring
    if (isStirring) {
      for (let i = 0; i < icePositions.length; i++) {
        for (let j = i + 1; j < icePositions.length; j++) {
          let a = icePositions[i];
          let b = icePositions[j];

          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = p.sqrt(dx * dx + dy * dy);
          let minDist = (a.size + b.size) * 0.42;

          if (d < minDist) {
            let overlap = minDist - d;

            if (d < 0.001) {
              dx = 1;
              dy = 0;
              d = 1;
            }

            let nx = dx / d;
            let ny = dy / d;

            a.x -= nx * overlap * 0.3;
            a.y -= ny * overlap * 0.12;
            b.x += nx * overlap * 0.3;
            b.y += ny * overlap * 0.12;
          }
        }
      }
    }

    // draw ice cubes
    for (let i = 0; i < icePositions.length; i++) {
      let ice = icePositions[i];

      ice.x = p.constrain(ice.x, cupX - 78, cupX + 78);
      ice.y = p.constrain(ice.y, iceBandTop, p.min(cupY + cupH / 2 - 70, liquidTop + liquidH - 28));

      p.push();
      p.translate(ice.x, ice.y);
      p.rotate(ice.angle);
      p.rectMode(p.CENTER);

      // outer cube
      p.stroke(120, 165, 195, ice.alpha * 0.7);
      p.strokeWeight(2);
      p.fill(230, 245, 255, ice.alpha);
      p.rect(0, 0, ice.size, ice.size, 8);

      // inner pale blue
      p.noStroke();
      p.fill(180, 225, 255, ice.alpha * 0.95);
      p.rect(-3, -3, ice.size * 0.7, ice.size * 0.7, 5);

      // highlight
      p.fill(255, 255, 255, ice.alpha);
      p.rect(-ice.size * 0.16, -ice.size * 0.18, ice.size * 0.30, ice.size * 0.18, 4);

      // shine line
      p.stroke(255, 255, 255, ice.alpha * 0.75);
      p.strokeWeight(1.4);
      p.line(-ice.size * 0.18, -ice.size * 0.05, ice.size * 0.05, -ice.size * 0.20);

      p.pop();
    }

    // ---------------- boba ----------------
    p.noStroke();
    p.fill(45, 30, 25, 220);

    let visibleBobaCount = p.constrain(remainingMinutes, 0, totalMinutes);

    for (let i = 0; i < visibleBobaCount; i++) {
      let b = bobas[i];

      let floatX = p.sin(p.frameCount * 0.018 + b.phase) * 1.3;
      let floatY = p.cos(p.frameCount * 0.016 + b.phase) * 1.0;

      let moveX = 0;
      let moveY = 0;

      if (isStirring) {
        let t = (p.millis() - stirStartTime) / STIR_DURATION;
        t = p.constrain(t, 0, 1);
        let ease = p.sin(t * p.PI);

        moveX = p.sin(t * p.TWO_PI * 0.85 + b.phase) * 4.0 * ease;
        moveY = p.cos(t * p.TWO_PI * 0.75 + b.phase) * 2.8 * ease;
      }

      let bx = cupX + b.x + floatX + moveX;
      let by = cupY + b.y + floatY + moveY;

      bx = p.constrain(bx, cupX - 90, cupX + 90);
      by = p.constrain(by, cupY + 52, cupY + 155);

      p.circle(bx, by, b.size);
    }

    // straw
    p.stroke(180, 80, 90, 230);
    p.strokeWeight(13);

    let baseAngle = -0.15;
    let stirAngle = 0;
    let verticalMove = 0;

    if (isStirring) {
      let t = (p.millis() - stirStartTime) / STIR_DURATION;
      t = p.constrain(t, 0, 1);
      let ease = p.sin(t * p.PI);

      stirAngle = p.sin(t * p.TWO_PI * 0.85) * 0.08 * ease;
      verticalMove = p.sin(t * p.TWO_PI * 0.75) * 4.5 * ease;
    }

    let angle = baseAngle + stirAngle;

    let bendX = cupX + 28 + p.sin(angle) * 22;
    let bendY = cupY - 92 + verticalMove;

    let topX = bendX - 52 + p.sin(angle) * 45;
    let topY = 100 + verticalMove;

    let bottomX = cupX + 12 + p.sin(angle) * 38;
    let bottomY = cupY + 88 + verticalMove * 0.4;

    p.line(topX, topY, bendX, bendY);
    p.line(bendX, bendY, bottomX, bottomY);

    // subtle swirl
    if (isStirring) {
      p.noFill();
      p.stroke(255, 235, 205, 90);
      p.strokeWeight(2);

      let t = (p.millis() - stirStartTime) / STIR_DURATION;

      for (let i = 0; i < 2; i++) {
        p.arc(
          cupX,
          cupY + 86 + i * 24,
          82 + i * 22,
          20,
          t * p.TWO_PI * 0.8 + i,
          t * p.TWO_PI * 0.8 + p.PI + i
        );
      }
    }

    // cup highlight
    p.stroke(255, 255, 255, 120);
    p.strokeWeight(4);
    p.line(cupX - 78, cupY - 142, cupX - 52, cupY + 108);
  }

  function drawText(remainingSeconds) {
    let minutes = p.floor(remainingSeconds / 60);
    let seconds = p.floor(remainingSeconds % 60);

    p.fill(60);
    p.noStroke();
    p.textAlign(p.CENTER);

    p.textSize(32);
    p.text("Boba Focus Clock", p.width / 2, 62);

    p.textSize(18);
    p.text("Floating ice cubes melt as the drink goes down.", p.width / 2, 102);

    p.textSize(18);
    p.text("Boba decreases, ice shrinks, and the liquid slowly fades.", p.width / 2, 130);

    p.textSize(18);
    p.text("Click the canvas to restart.", p.width / 2, 158);

    p.textSize(38);
    p.text(p.nf(minutes, 2) + ":" + p.nf(seconds, 2), p.width / 2, 740);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});