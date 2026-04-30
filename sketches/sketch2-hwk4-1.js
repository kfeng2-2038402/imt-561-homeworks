// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.DEGREES);
    p.textFont("Arial");
  };

  p.draw = function () {
    let h = p.hour();
    let m = p.minute();
    let s = p.second();

    p.background(255, 252, 230);

    let winX = 190;
    let winY = 100;
    let winW = 420;
    let winH = 420;

    // Outer frame
    p.noFill();
    p.stroke(25);
    p.strokeWeight(7);
    p.rect(winX - 30, winY - 30, winW + 60, winH + 60, 8);

    p.strokeWeight(3);
    p.rect(winX, winY, winW, winH, 4);

    drawSunsetGradient(winX, winY, winW, winH);
    drawHorizonLayers(winX, winY, winW, winH);

    let progress = ((h % 12) + m / 60) / 12;
    drawSunArcPath(winX, winY, winW, winH, progress, s);

    drawSideCloud(130, 190, s);
    drawSecondTicks(winX, winY, winW, winH, s);

    // Title only
    p.noStroke();
    p.fill(20);
    p.textAlign(p.CENTER);
    p.textSize(52);
    p.text("Sunset Window Clock", p.width / 2, 660);

    // Canvas frame
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function drawSunArcPath(winX, winY, winW, winH, progress, sec) {
    let x1 = winX + winW - 55;
    let y1 = winY + 75;

    let cx1 = winX + winW - 5;
    let cy1 = winY + 205;

    let cx2 = winX + 180;
    let cy2 = winY + 250;

    let x2 = winX + 65;
    let y2 = winY + winH - 95;

    p.noFill();
    p.stroke(35);
    p.strokeWeight(3);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    let steps = 12;

    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let x = p.bezierPoint(x1, cx1, cx2, x2, t);
      let y = p.bezierPoint(y1, cy1, cy2, y2, t);

      let activeIndex = p.round(progress * (steps - 1));
      activeIndex = p.constrain(activeIndex, 0, steps - 1);

      if (i === activeIndex) {
        drawSunIcon(x, y, 34, true, sec);
      } else {
        drawSunIcon(x, y, 22, false, sec);
      }
    }
  }

  function drawSunIcon(x, y, size, isActive, sec) {
    if (isActive) {
      p.noStroke();
      p.fill(255, 230, 120, 90);
      p.circle(x, y, size * 2.4);

      p.stroke(35);
      p.strokeWeight(2);

      for (let i = 0; i < 10; i++) {
        let angle = i * 36 + sec * 2;
        let x1 = x + p.cos(angle) * (size * 0.8);
        let y1 = y + p.sin(angle) * (size * 0.8);
        let x2 = x + p.cos(angle) * (size * 1.2);
        let y2 = y + p.sin(angle) * (size * 1.2);
        p.line(x1, y1, x2, y2);
      }

      p.fill(255, 210, 45);
      p.stroke(35);
      p.strokeWeight(3);
      p.circle(x, y, size);
    } else {
      p.fill(255, 235, 120);
      p.stroke(35);
      p.strokeWeight(2);
      p.circle(x, y, size);
    }
  }

  function drawSunsetGradient(x, y, w, h) {
    let c1 = p.color(255, 255, 120);
    let c2 = p.color(255, 185, 70);
    let c3 = p.color(255, 90, 45);
    let c4 = p.color(170, 25, 45);

    for (let i = 0; i < h; i++) {
      let t = p.map(i, 0, h, 0, 1);
      let c;

      if (t < 0.28) {
        c = p.lerpColor(c1, c2, p.map(t, 0, 0.28, 0, 1));
      } else if (t < 0.62) {
        c = p.lerpColor(c2, c3, p.map(t, 0.28, 0.62, 0, 1));
      } else {
        c = p.lerpColor(c3, c4, p.map(t, 0.62, 1, 0, 1));
      }

      p.stroke(c);
      p.line(x, y + i, x + w, y + i);
    }

    p.noStroke();
    p.fill(255, 230, 100, 45);
    p.rect(x, y + 40, w, 70);

    p.fill(255, 150, 55, 55);
    p.rect(x, y + 160, w, 80);

    p.fill(230, 40, 55, 50);
    p.rect(x, y + 300, w, 90);
  }

  function drawHorizonLayers(x, y, w, h) {
    p.noStroke();

    p.fill(255, 205, 80, 100);
    p.beginShape();
    p.vertex(x, y + 165);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 165 + p.sin(i * 0.08) * 7);
    }
    p.vertex(x + w, y + 230);
    p.vertex(x, y + 230);
    p.endShape(p.CLOSE);

    p.fill(245, 110, 55, 135);
    p.beginShape();
    p.vertex(x, y + 240);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 235 + p.sin(i * 0.07) * 9);
    }
    p.vertex(x + w, y + 330);
    p.vertex(x, y + 330);
    p.endShape(p.CLOSE);

    p.fill(190, 35, 45, 155);
    p.beginShape();
    p.vertex(x, y + 315);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 305 + p.sin(i * 0.06) * 8);
    }
    p.vertex(x + w, y + h);
    p.vertex(x, y + h);
    p.endShape(p.CLOSE);
  }

  function drawSecondTicks(x, y, w, h, sec) {
    let tickPositions = [
      [x + 95, y + 35, -25],
      [x + w / 2, y + 25, 0],
      [x + w - 95, y + 35, 25],
      [x + w - 35, y + 105, 60],
      [x + w - 35, y + h - 95, 120],
      [x + w / 2, y + h - 35, 90],
      [x + 95, y + h - 35, 60],
      [x + 35, y + h - 95, 120],
      [x + 35, y + 105, 60]
    ];

    for (let i = 0; i < tickPositions.length; i++) {
      let tx = tickPositions[i][0];
      let ty = tickPositions[i][1];
      let angle = tickPositions[i][2];

      let activeIndex = p.floor(p.map(sec, 0, 60, 0, tickPositions.length));

      if (i === activeIndex) {
        p.stroke(255, 245, 160);
        p.strokeWeight(6);
      } else {
        p.stroke(25);
        p.strokeWeight(4);
      }

      p.push();
      p.translate(tx, ty);
      p.rotate(angle);
      p.line(-12, 0, 12, 0);
      p.pop();
    }
  }

  function drawSideCloud(x, y, sec) {
    let move = p.sin(sec * 6) * 8;

    p.noStroke();
    p.fill(255);
    p.ellipse(x + move, y, 85, 42);
    p.ellipse(x + 45 + move, y - 12, 70, 60);
    p.ellipse(x + 85 + move, y, 85, 42);

    p.stroke(25);
    p.strokeWeight(4);
    p.noFill();
    p.arc(x + move, y, 85, 42, 180, 360);
    p.arc(x + 45 + move, y - 12, 70, 60, 180, 360);
    p.arc(x + 85 + move, y, 85, 42, 180, 360);
    p.line(x - 40 + move, y, x + 125 + move, y);

    p.strokeWeight(3);
    p.line(x + 25 + move, y + 50, x + 120 + move, y + 50);
    p.line(x + 45 + move, y + 70, x + 105 + move, y + 70);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});