registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const SESSION_LENGTH = 2 * 60 * 1000; // 2 minutes for testing

  let sessionStartTime = null;
  let isSessionRunning = false;

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.DEGREES);
    p.textFont("Arial");
  };

  p.draw = function () {
    let sessionProgress = 0;

    if (isSessionRunning) {
      let elapsed = p.millis() - sessionStartTime;
      sessionProgress = p.constrain(elapsed / SESSION_LENGTH, 0, 1);
    }

    drawRoomBackground(sessionProgress);

    let winX = 190;
    let winY = 100;
    let winW = 420;
    let winH = 420;

    // Outer frame
    p.noFill();
    p.stroke(25);
    p.strokeWeight(7);
    p.rect(winX - 30, winY - 30, winW + 60, winH + 60, 8);

    // Inner frame
    p.strokeWeight(3);
    p.rect(winX, winY, winW, winH, 4);

    // Window content
    drawFocusGradient(winX, winY, winW, winH, sessionProgress);
    drawAtmosphericGlow(winX, winY, winW, winH, sessionProgress);
    drawSunArcPath(winX, winY, winW, winH, sessionProgress);
    drawFogClouds(winX, winY, winW, winH, sessionProgress);

    // Title
    p.noStroke();
    p.fill(20);
    p.textAlign(p.CENTER);
    p.textSize(48);
    p.text("Focus Window Clock", p.width / 2, 660);

    p.textSize(18);
    p.fill(70);
    p.text("Click to start a 2-minute focus session", p.width / 2, 700);

    p.textSize(22);
    if (isSessionRunning) {
      p.text(p.floor(sessionProgress * 100) + "% clear", p.width / 2, 735);
    } else {
      p.text("Start Study", p.width / 2, 735);
    }

    // Canvas border
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.mousePressed = function () {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      isSessionRunning = true;
      sessionStartTime = p.millis();
    }
  };

  // ----------------------------
  // Smooth room background
  // ----------------------------
  function drawRoomBackground(progress) {
    let topAnchors = [
      { t: 0.00, c: p.color(244, 242, 236) },
      { t: 0.30, c: p.color(240, 242, 236) },
      { t: 0.65, c: p.color(244, 235, 222) },
      { t: 1.00, c: p.color(225, 228, 238) }
    ];

    let bottomAnchors = [
      { t: 0.00, c: p.color(236, 232, 225) },
      { t: 0.30, c: p.color(236, 236, 230) },
      { t: 0.65, c: p.color(236, 223, 214) },
      { t: 1.00, c: p.color(210, 216, 232) }
    ];

    let topColor = getInterpolatedColor(progress, topAnchors);
    let bottomColor = getInterpolatedColor(progress, bottomAnchors);

    for (let i = 0; i < p.height; i++) {
      let t = i / (p.height - 1);
      t = smoothstep(t);
      let c = p.lerpColor(topColor, bottomColor, t);
      p.stroke(c);
      p.line(0, i, p.width, i);
    }
  }

  // ----------------------------
  // Smooth sky gradient
  // ----------------------------
  function drawFocusGradient(x, y, w, h, progress) {
    let palette = getSkyPalette(progress);

    let stops = [
      { pos: 0.00, color: palette.zenith },
      { pos: 0.22, color: palette.upper },
      { pos: 0.55, color: palette.mid },
      { pos: 0.82, color: palette.lower },
      { pos: 1.00, color: palette.horizon }
    ];

    for (let i = 0; i < h; i++) {
      let t = i / (h - 1);
      let c = sampleGradientStops(stops, t);
      p.stroke(c);
      p.line(x, y + i, x + w, y + i);
    }

    let clarity = p.constrain(p.map(progress, 0.15, 0.85, 0, 1), 0, 1);
    clarity = smoothstep(clarity);

    p.noStroke();

    // Stronger center glow after fog clears
    p.fill(255, 244, 210, 16 + clarity * 30);
    p.ellipse(x + w * 0.52, y + h * 0.56, w * 1.02, h * 0.46);

    // Soft upper brightness
    p.fill(255, 255, 255, 8 + clarity * 14);
    p.ellipse(x + w * 0.5, y + h * 0.16, w * 0.9, h * 0.26);
  }

  function getSkyPalette(progress) {
    let anchors = [
      {
        t: 0.00,
        zenith: p.color(220, 228, 234),
        upper: p.color(228, 234, 238),
        mid: p.color(236, 238, 236),
        lower: p.color(242, 240, 232),
        horizon: p.color(247, 244, 236)
      },
      {
        t: 0.25,
        zenith: p.color(188, 214, 238),
        upper: p.color(205, 224, 243),
        mid: p.color(224, 236, 248),
        lower: p.color(236, 242, 248),
        horizon: p.color(244, 246, 248)
      },
      {
        t: 0.50,
        zenith: p.color(132, 188, 238),
        upper: p.color(168, 208, 245),
        mid: p.color(206, 228, 246),
        lower: p.color(238, 236, 214),
        horizon: p.color(252, 226, 180)
      },
      {
        t: 0.75,
        zenith: p.color(120, 154, 220),
        upper: p.color(205, 194, 232),
        mid: p.color(255, 214, 152),
        lower: p.color(248, 176, 126),
        horizon: p.color(224, 136, 128)
      },
      {
        t: 1.00,
        zenith: p.color(72, 94, 170),
        upper: p.color(122, 132, 198),
        mid: p.color(210, 164, 178),
        lower: p.color(182, 112, 140),
        horizon: p.color(118, 88, 128)
      }
    ];

    return {
      zenith: getInterpolatedPaletteColor(progress, anchors, "zenith"),
      upper: getInterpolatedPaletteColor(progress, anchors, "upper"),
      mid: getInterpolatedPaletteColor(progress, anchors, "mid"),
      lower: getInterpolatedPaletteColor(progress, anchors, "lower"),
      horizon: getInterpolatedPaletteColor(progress, anchors, "horizon")
    };
  }

  function sampleGradientStops(stops, t) {
    t = p.constrain(t, 0, 1);

    for (let i = 0; i < stops.length - 1; i++) {
      let a = stops[i];
      let b = stops[i + 1];

      if (t >= a.pos && t <= b.pos) {
        let localT = p.map(t, a.pos, b.pos, 0, 1);
        localT = smoothstep(localT);
        return p.lerpColor(a.color, b.color, localT);
      }
    }

    return stops[stops.length - 1].color;
  }

  // ----------------------------
  // Soft atmosphere, no hard trapezoid layers
  // ----------------------------
  function drawAtmosphericGlow(x, y, w, h, progress) {
    let warmth = p.constrain(p.map(progress, 0.35, 1, 0, 1), 0, 1);
    warmth = smoothstep(warmth);

    p.noStroke();

    p.fill(255, 240, 220, 16 + warmth * 12);
    p.ellipse(x + w * 0.5, y + h * 0.88, w * 1.25, h * 0.36);

    p.fill(255, 205, 150, warmth * 24);
    p.ellipse(x + w * 0.5, y + h * 0.84, w * 1.05, h * 0.18);

    p.fill(255, 255, 255, 10);
    p.ellipse(x + w * 0.5, y + h * 0.68, w * 1.05, h * 0.22);
  }

  // ----------------------------
  // Sun path as focus progress
  // ----------------------------
  function drawSunArcPath(winX, winY, winW, winH, progress) {
    let x1 = winX + winW - 55;
    let y1 = winY + 78;

    let cx1 = winX + winW - 5;
    let cy1 = winY + 210;

    let cx2 = winX + 180;
    let cy2 = winY + 245;

    let x2 = winX + 65;
    let y2 = winY + winH - 95;

    p.noFill();
    p.stroke(255, 255, 255, 80);
    p.strokeWeight(2);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    let steps = 8;
    let activeIndex = p.round(progress * (steps - 1));
    activeIndex = p.constrain(activeIndex, 0, steps - 1);

    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let x = p.bezierPoint(x1, cx1, cx2, x2, t);
      let y = p.bezierPoint(y1, cy1, cy2, y2, t);

      if (i === activeIndex) {
        drawSunIcon(x, y, 34, true, progress);
      } else {
        drawSunIcon(x, y, 16, false, progress);
      }
    }
  }

  function drawSunIcon(x, y, size, isActive, progress) {
    if (isActive) {
      let glowAlpha = p.map(progress, 0, 1, 35, 115);

      p.noStroke();
      p.fill(255, 226, 120, glowAlpha);
      p.circle(x, y, size * 2.8);

      p.stroke(40, 80);
      p.strokeWeight(1.6);

      for (let i = 0; i < 10; i++) {
        let angle = i * 36 + p.frameCount * 0.22;
        let x1 = x + p.cos(angle) * (size * 0.85);
        let y1 = y + p.sin(angle) * (size * 0.85);
        let x2 = x + p.cos(angle) * (size * 1.25);
        let y2 = y + p.sin(angle) * (size * 1.25);
        p.line(x1, y1, x2, y2);
      }

      p.noStroke();
      p.fill(255, 212, 75);
      p.circle(x, y, size);
    } else {
      p.noStroke();
      p.fill(255, 238, 165, 65);
      p.circle(x, y, size);
    }
  }

  // ----------------------------
  // Fog clouds: center opens outward
  // ----------------------------
  function drawFogClouds(x, y, w, h, progress) {
    let clearProgress = smoothstep(progress);

    // Clouds move farther outward, so the clearing is visible
    let spreadMain = p.lerp(0, 210, clearProgress);
    let spreadSide = p.lerp(0, 140, clearProgress);

    // Fog fades more strongly over time
    let alphaMain = p.lerp(210, 0, clearProgress);
    let alphaSoft = p.lerp(120, 0, clearProgress);

    let centerX = x + w / 2;
    let topY = y + 120;

    p.noStroke();

    // General mist at the beginning
    p.fill(255, 255, 255, alphaSoft * 0.22);
    p.ellipse(centerX, y + 120, w * 0.9, 90);
    p.ellipse(centerX, y + 165, w * 0.75, 70);

    // Stronger center opening glow
    let openingW = p.lerp(w * 0.12, w * 0.62, clearProgress);
    let openingH = p.lerp(h * 0.10, h * 0.26, clearProgress);

    p.fill(255, 248, 215, p.lerp(0, 65, clearProgress));
    p.ellipse(centerX, y + 150, openingW, openingH);

    p.fill(255, 255, 255, p.lerp(0, 28, clearProgress));
    p.ellipse(centerX, y + 135, openingW * 0.82, openingH * 0.72);

    // Main clouds: start near center, then split outward
    drawFogCloudShape(centerX - spreadMain, topY + 8, 1.00, alphaMain);
    drawFogCloudShape(centerX, topY + 30, 0.82, alphaMain * 0.92);
    drawFogCloudShape(centerX + spreadMain, topY - 2, 0.96, alphaMain);

    // Secondary clouds
    drawFogCloudShape(centerX - spreadSide, y + 190, 0.68, alphaMain * 0.62);
    drawFogCloudShape(centerX + spreadSide, y + 200, 0.64, alphaMain * 0.56);

    // Remaining center mist
    drawFogCloudShape(centerX, y + 245, 0.52, alphaMain * 0.35);

    // Vertical clear path
    p.fill(255, 250, 220, p.lerp(0, 20, clearProgress));
    p.ellipse(centerX, y + 190, w * 0.22, h * 0.42);
  }

  function drawFogCloudShape(cx, cy, scaleFactor, alpha) {
    let drift = p.sin(p.frameCount * 0.12 + cx * 0.01) * 1.8;

    p.push();
    p.translate(cx + drift, cy);
    p.scale(scaleFactor);

    p.noStroke();
    p.fill(255, 255, 255, alpha * 0.34);
    p.ellipse(-48, 8, 62, 28);
    p.ellipse(-18, -4, 68, 34);
    p.ellipse(18, -6, 72, 36);
    p.ellipse(52, 6, 60, 26);

    p.fill(255, 255, 255, alpha * 0.22);
    p.ellipse(2, 16, 132, 22);

    p.fill(255, 255, 255, alpha * 0.14);
    p.ellipse(0, 4, 110, 30);

    p.stroke(255, 255, 255, alpha * 0.18);
    p.strokeWeight(1.2);
    p.noFill();
    p.arc(-48, 8, 62, 28, 185, 355);
    p.arc(-18, -4, 68, 34, 185, 355);
    p.arc(18, -6, 72, 36, 185, 355);
    p.arc(52, 6, 60, 26, 185, 355);

    p.pop();
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  function getInterpolatedPaletteColor(progress, anchors, key) {
    for (let i = 0; i < anchors.length - 1; i++) {
      let a = anchors[i];
      let b = anchors[i + 1];

      if (progress >= a.t && progress <= b.t) {
        let localT = p.map(progress, a.t, b.t, 0, 1);
        localT = smoothstep(localT);
        return p.lerpColor(a[key], b[key], localT);
      }
    }

    return anchors[anchors.length - 1][key];
  }

  function getInterpolatedColor(progress, anchors) {
    for (let i = 0; i < anchors.length - 1; i++) {
      let a = anchors[i];
      let b = anchors[i + 1];

      if (progress >= a.t && progress <= b.t) {
        let localT = p.map(progress, a.t, b.t, 0, 1);
        localT = smoothstep(localT);
        return p.lerpColor(a.c, b.c, localT);
      }
    }

    return anchors[anchors.length - 1].c;
  }

  function smoothstep(t) {
    t = p.constrain(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});