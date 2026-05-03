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

    p.strokeWeight(3);
    p.rect(winX, winY, winW, winH, 4);

    // Window content
    drawFocusGradient(winX, winY, winW, winH, sessionProgress);
    drawHorizonLayers(winX, winY, winW, winH, sessionProgress);
    drawSunArcPath(winX, winY, winW, winH, sessionProgress);
    drawFogClouds(winX, winY, winW, winH, sessionProgress);

    // Title
    p.noStroke();
    p.fill(20);
    p.textAlign(p.CENTER);
    p.textSize(52);
    p.text("Sunset Window Clock", p.width / 2, 660);

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
  // Background outside the window
  // ----------------------------
  function drawRoomBackground(progress) {
    let wallAnchors = [
      { t: 0.00, c: p.color(244, 242, 236) },
      { t: 0.25, c: p.color(244, 243, 233) },
      { t: 0.55, c: p.color(248, 238, 220) },
      { t: 0.78, c: p.color(242, 226, 210) },
      { t: 1.00, c: p.color(226, 228, 238) }
    ];

    let bg = getInterpolatedColor(progress, wallAnchors);
    p.background(bg);
  }

  // ----------------------------
  // Sun path
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
    p.stroke(255, 255, 255, 110);
    p.strokeWeight(2.5);
    p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

    let steps = 12;
    let activeIndex = p.round(progress * (steps - 1));
    activeIndex = p.constrain(activeIndex, 0, steps - 1);

    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let x = p.bezierPoint(x1, cx1, cx2, x2, t);
      let y = p.bezierPoint(y1, cy1, cy2, y2, t);

      if (i === activeIndex) {
        drawSunIcon(x, y, 34, true, progress);
      } else {
        drawSunIcon(x, y, 20, false, progress);
      }
    }
  }

  function drawSunIcon(x, y, size, isActive, progress) {
    if (isActive) {
      let glowAlpha = p.map(progress, 0, 1, 35, 110);

      p.noStroke();
      p.fill(255, 228, 120, glowAlpha);
      p.circle(x, y, size * 2.7);

      p.stroke(40, 80);
      p.strokeWeight(1.8);

      for (let i = 0; i < 10; i++) {
        let angle = i * 36 + p.frameCount * 0.25;
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
      p.fill(255, 238, 165, 95);
      p.circle(x, y, size);
    }
  }

  // ----------------------------
  // Sky gradient - like a whole day
  // ----------------------------
  function drawFocusGradient(x, y, w, h, progress) {
    let palette = getSkyPalette(progress);

    for (let i = 0; i < h; i++) {
      let yn = i / (h - 1);
      let c = getVerticalGradientColor(
        yn,
        palette.zenith,
        palette.upper,
        palette.mid,
        palette.horizon
      );

      p.stroke(c);
      p.line(x, y + i, x + w, y + i);
    }

    // subtle atmospheric glow
    let g = smoothstep(progress);

    p.noStroke();

    // general daylight glow
    p.fill(255, 245, 205, 8 + g * 22);
    p.ellipse(x + w * 0.5, y + h * 0.46, w * 0.9, h * 0.42);

    // low horizon warmth near sunset phase
    let sunsetGlow = p.constrain(p.map(progress, 0.55, 0.85, 0, 1), 0, 1);
    sunsetGlow = smoothstep(sunsetGlow);

    p.fill(255, 188, 120, sunsetGlow * 35);
    p.ellipse(x + w * 0.5, y + h * 0.72, w * 0.95, h * 0.28);
  }

  function getSkyPalette(progress) {
    let anchors = [
      // early morning gloomy gray-white
      {
        t: 0.00,
        zenith: p.color(224, 230, 236),
        upper: p.color(230, 235, 239),
        mid: p.color(238, 240, 238),
        horizon: p.color(247, 245, 240)
      },
      // morning pale blue
      {
        t: 0.18,
        zenith: p.color(188, 214, 240),
        upper: p.color(204, 225, 245),
        mid: p.color(224, 238, 250),
        horizon: p.color(246, 248, 252)
      },
      // noon brighter blue
      {
        t: 0.38,
        zenith: p.color(112, 178, 238),
        upper: p.color(150, 205, 248),
        mid: p.color(195, 228, 250),
        horizon: p.color(235, 245, 255)
      },
      // afternoon warm yellow
      {
        t: 0.58,
        zenith: p.color(150, 195, 238),
        upper: p.color(210, 224, 245),
        mid: p.color(255, 232, 170),
        horizon: p.color(255, 220, 150)
      },
      // sunset gold-orange-purple
      {
        t: 0.80,
        zenith: p.color(108, 122, 200),
        upper: p.color(255, 182, 118),
        mid: p.color(255, 148, 112),
        horizon: p.color(210, 106, 125)
      },
      // night
      {
        t: 1.00,
        zenith: p.color(28, 44, 96),
        upper: p.color(48, 64, 122),
        mid: p.color(78, 72, 136),
        horizon: p.color(46, 48, 100)
      }
    ];

    return {
      zenith: getInterpolatedPaletteColor(progress, anchors, "zenith"),
      upper: getInterpolatedPaletteColor(progress, anchors, "upper"),
      mid: getInterpolatedPaletteColor(progress, anchors, "mid"),
      horizon: getInterpolatedPaletteColor(progress, anchors, "horizon")
    };
  }

  function getVerticalGradientColor(yn, c1, c2, c3, c4) {
    yn = p.constrain(yn, 0, 1);

    if (yn < 0.26) {
      let t = smoothstep(p.map(yn, 0, 0.26, 0, 1));
      return p.lerpColor(c1, c2, t);
    } else if (yn < 0.60) {
      let t = smoothstep(p.map(yn, 0.26, 0.60, 0, 1));
      return p.lerpColor(c2, c3, t);
    } else {
      let t = smoothstep(p.map(yn, 0.60, 1, 0, 1));
      return p.lerpColor(c3, c4, t);
    }
  }

  // ----------------------------
  // Horizon
  // ----------------------------
  function drawHorizonLayers(x, y, w, h, progress) {
    p.noStroke();

    let layer1Alpha = p.map(progress, 0, 1, 26, 75);
    let layer2Alpha = p.map(progress, 0, 1, 35, 95);
    let layer3Alpha = p.map(progress, 0, 1, 45, 110);

    p.fill(255, 210, 125, layer1Alpha);
    p.beginShape();
    p.vertex(x, y + 188);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 188 + p.sin(i * 0.08) * 6);
    }
    p.vertex(x + w, y + 245);
    p.vertex(x, y + 245);
    p.endShape(p.CLOSE);

    p.fill(232, 136, 98, layer2Alpha);
    p.beginShape();
    p.vertex(x, y + 258);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 250 + p.sin(i * 0.07) * 8);
    }
    p.vertex(x + w, y + 336);
    p.vertex(x, y + 336);
    p.endShape(p.CLOSE);

    p.fill(145, 70, 92, layer3Alpha);
    p.beginShape();
    p.vertex(x, y + 326);
    for (let i = 0; i <= w; i += 25) {
      p.vertex(x + i, y + 316 + p.sin(i * 0.06) * 7);
    }
    p.vertex(x + w, y + h);
    p.vertex(x, y + h);
    p.endShape(p.CLOSE);
  }

  // ----------------------------
  // Fog clouds: center -> left/right -> disappear
  // ----------------------------
  function drawFogClouds(x, y, w, h, progress) {
    let spread = p.map(progress, 0, 1, 0, 150);
    let alpha = p.map(progress, 0, 1, 165, 0);

    let centerX = x + w / 2;
    let topBandY = y + 118;

    // soft general mist in upper half
    p.noStroke();
    p.fill(255, 255, 255, alpha * 0.08);
    p.ellipse(centerX, y + 120, w * 0.72, 78);
    p.ellipse(centerX, y + 165, w * 0.62, 62);

    // three fog-cloud groups start near center and drift outward
    drawFogCloudShape(centerX - spread * 0.95, topBandY + 2, 0.88, alpha);
    drawFogCloudShape(centerX, topBandY + 34, 0.72, alpha * 0.82);
    drawFogCloudShape(centerX + spread * 0.95, topBandY - 8, 0.84, alpha * 0.95);

    // smaller supporting clouds
    drawFogCloudShape(centerX - spread * 0.55, y + 175, 0.58, alpha * 0.62);
    drawFogCloudShape(centerX + spread * 0.55, y + 192, 0.54, alpha * 0.56);

    // warm opening in the middle
    let opening = p.map(progress, 0, 1, 0.06, 0.62);
    p.fill(255, 245, 200, p.map(progress, 0, 1, 0, 28));
    p.ellipse(centerX, y + 150, w * opening, h * 0.26);
  }

  function drawFogCloudShape(cx, cy, scaleFactor, alpha) {
    let drift = p.sin(p.frameCount * 0.18 + cx * 0.02) * 2.5;

    p.push();
    p.translate(cx + drift, cy);
    p.scale(scaleFactor);

    // soft cloud body
    p.noStroke();
    p.fill(255, 255, 255, alpha * 0.28);
    p.ellipse(-42, 8, 54, 24);
    p.ellipse(-14, -2, 58, 28);
    p.ellipse(16, -6, 62, 30);
    p.ellipse(46, 4, 52, 22);
    p.ellipse(8, 12, 110, 18);

    // lighter lower haze
    p.fill(255, 255, 255, alpha * 0.16);
    p.ellipse(0, 18, 120, 14);

    // very soft outline so it reads as cloud
    p.stroke(255, 255, 255, alpha * 0.22);
    p.strokeWeight(1.4);
    p.noFill();
    p.arc(-42, 8, 54, 24, 185, 355);
    p.arc(-14, -2, 58, 28, 185, 355);
    p.arc(16, -6, 62, 30, 185, 355);
    p.arc(46, 4, 52, 22, 185, 355);

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