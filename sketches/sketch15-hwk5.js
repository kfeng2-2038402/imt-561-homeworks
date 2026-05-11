registerSketch('sk15', function (p) {
  let weatherTable;
  let monthlyData = [];
  let hoveredMonth = null;

  const CANVAS_W = 1080;
  const CANVAS_H = 1350;

  p.preload = function () {
    weatherTable = p.loadTable(
      "data/seattle_weather_2025_monthly.csv",
      "csv",
      "header"
    );
  };

  p.setup = function () {
    p.createCanvas(CANVAS_W, CANVAS_H);
    p.textFont("Arial");
    p.angleMode(p.RADIANS);

    for (let i = 0; i < weatherTable.getRowCount(); i++) {
      monthlyData.push({
        monthNum: weatherTable.getNum(i, "month_num"),
        month: weatherTable.getString(i, "month"),
        avgDaylight: weatherTable.getNum(i, "avg_daylight_hours"),
        totalPrecip: weatherTable.getNum(i, "total_precip_inches"),
        rainyDays: weatherTable.getNum(i, "rainy_days"),
        heavyRainDays: weatherTable.getNum(i, "heavy_rain_days"),
        avgCloud: weatherTable.getNum(i, "avg_cloudcover_pct"),
        cloudyDays: weatherTable.getNum(i, "cloudy_days_75pct_plus"),
        solarEnergy: weatherTable.getNum(i, "avg_solarenergy_MJ_m2"),
        avgTemp: weatherTable.getNum(i, "avg_temp_f"),
        daysInMonth: weatherTable.getNum(i, "days_in_month")
      });
    }
  };

  p.draw = function () {
    p.background(248, 246, 240);

    drawTitle();
    drawDoubleRing();
    drawFeltWinterIndicator();
    drawCenterText();
    drawStoryLabels();
    drawAnnotations();
    drawLegend();
    drawSource();

    if (hoveredMonth !== null) {
      drawTooltip(monthlyData[hoveredMonth]);
    }

    p.noFill();
    p.stroke(210);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_W, CANVAS_H);
  };

  // =========================
  // Text and labels
  // =========================

  function drawTitle() {
    p.noStroke();
    p.fill(32, 32, 32);
    p.textAlign(p.CENTER, p.TOP);

    p.textStyle(p.BOLD);
    p.textSize(34);
    p.text("Why Seattle Winter Feels Longer Than Three Months", p.width / 2, 35);

    p.stroke(70);
    p.strokeWeight(2);
    p.line(70, 85, p.width - 70, 85);

    p.noStroke();
    p.fill(75, 75, 75);
    p.textStyle(p.NORMAL);
    p.textSize(22);
    p.text(
      "The calendar says winter is short. Seattle weather tells a longer story.",
      p.width / 2,
      100
    );
  }

  function drawStoryLabels() {
    const cx = p.width / 2;

    p.noStroke();
    p.fill(38, 38, 38);
    p.textAlign(p.CENTER, p.CENTER);

    p.textStyle(p.BOLD);
    p.textSize(27);
    p.text("SEATTLE WINTER FEELING", cx, 230);

    p.textStyle(p.NORMAL);
    p.textSize(20);
    p.text("Weather-based pattern: Oct–Mar", cx, 260);
  }

  function drawCenterText() {
    const cx = p.width / 2;
    const cy = 620;

    p.fill(35, 35, 35);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);

    p.textStyle(p.BOLD);
    p.textSize(24);
    p.text("Official winter:", cx, cy - 48);

    p.textStyle(p.NORMAL);
    p.textSize(22);
    p.text("Dec–Feb", cx, cy - 18);

    p.stroke(70);
    p.strokeWeight(1.5);
    p.line(cx - 92, cy + 12, cx + 92, cy + 12);

    p.noStroke();
    p.textStyle(p.BOLD);
    p.textSize(23);
    p.text("Felt winter pattern:", cx, cy + 45);

    p.textStyle(p.NORMAL);
    p.textSize(22);
    p.text("Oct–Mar", cx, cy + 75);

    p.fill(95, 95, 95);
    p.textStyle(p.NORMAL);
    p.textSize(13);
    p.text("Inner ring shows calendar months.", cx, cy + 108);
  }

  function drawAnnotations() {
    p.noStroke();
    p.fill(55, 55, 55);
    p.textSize(18);
    p.textAlign(p.LEFT, p.TOP);
    p.textStyle(p.NORMAL);

    p.text("The darker, wetter\npattern begins before\nofficial winter starts.", 55, 350);
    p.stroke(70);
    p.strokeWeight(2);
    drawArrow(175, 420, 242, 458);

    p.noStroke();
    p.fill(55, 55, 55);
    p.text("Shortest daylight\nanchors the winter\nfeeling.", 735, 195);
    p.stroke(70);
    p.strokeWeight(2);
    drawArrow(765, 270, 680, 300);

    p.noStroke();
    p.fill(55, 55, 55);
    p.text("Daylight returns,\nbut March still\ncarries rain.", 890, 470);
    p.stroke(70);
    p.strokeWeight(2);
    drawArrow(915, 540, 835, 555);

    p.noStroke();
    p.fill(95, 95, 95);
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(
      "“Felt winter” is an interpretive framing based on 2025 daylight,\nprecipitation, and cloud-cover patterns. Actual experience varies by person and year.",
      70,
      1115
    );
  }

  function drawLegend() {
    const x = 770;
    const y = 970;
    const w = 260;
    const h = 215;

    p.noStroke();
    p.fill(255, 252, 246, 245);
    p.rect(x, y, w, h, 16);

    p.stroke(120);
    p.strokeWeight(1.2);
    p.noFill();
    p.rect(x, y, w, h, 16);

    p.noStroke();
    p.fill(45, 58, 92);
    p.rect(x + 18, y + 24, 28, 22);

    p.fill(50);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(15);
    p.textStyle(p.NORMAL);
    p.text("= shorter daylight", x + 58, y + 35);

    drawRaindrop(x + 31, y + 75, 7.5);
    drawRaindrop(x + 18, y + 88, 5.5);
    drawRaindrop(x + 44, y + 88, 5.5);

    p.fill(50);
    p.text("= monthly precipitation", x + 58, y + 82);

    p.noStroke();
    p.fill(223, 231, 242);
    p.rect(x + 18, y + 124, 28, 22);

    p.stroke(160);
    p.strokeWeight(1);
    p.line(x + 18, y + 124, x + 46, y + 146);
    p.line(x + 24, y + 124, x + 52, y + 146);
    p.line(x + 12, y + 124, x + 40, y + 146);

    p.noStroke();
    p.fill(50);
    p.text("= official winter\n   in inner ring", x + 58, y + 132);

    drawSunIcon(x + 30, y + 180, 0.38);
    drawSunCloudIcon(x + 72, y + 180, 0.38);
    drawCloudIcon(x + 118, y + 180, 0.38);

    p.fill(50);
    p.text("= seasonal reference icons", x + 145, y + 180);
  }

  function drawSource() {
    p.noStroke();
    p.fill(100, 100, 100);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(14);
    p.text(
      "Data: 2025 Seattle historical weather data from Visual Crossing. Daily records cleaned into monthly summaries.",
      p.width / 2,
      p.height - 25
    );
  }

  // =========================
  // Main visualization
  // =========================

  function drawDoubleRing() {
    const cx = p.width / 2;
    const cy = 620;

    const outerOuterR = 345;
    const outerInnerR = 235;

    const innerOuterR = 215;
    const innerInnerR = 120;

    const seg = p.TWO_PI / 12;

    hoveredMonth = getHoveredMonth(cx, cy, innerInnerR, outerOuterR);

    // OUTER RING:
    // color = average daylight hours
    // raindrops = total monthly precipitation
    for (let i = 0; i < monthlyData.length; i++) {
      const d = monthlyData[i];
      const centerAngle = -p.HALF_PI + i * seg;
      const startAngle = centerAngle - seg * 0.5;
      const endAngle = centerAngle + seg * 0.5;

      const baseColor = getDaylightColor(d.avgDaylight);
      const isHover = hoveredMonth === i;

      p.noStroke();
      p.fill(baseColor);
      drawRingSegment(cx, cy, outerInnerR, outerOuterR, startAngle, endAngle);

      p.stroke(245, 245, 238, 210);
      p.strokeWeight(1.2);
      p.noFill();
      drawRingSegment(cx, cy, outerInnerR, outerOuterR, startAngle, endAngle);

      if (isFeltWinterMonth(i)) {
        p.stroke(35, 45, 65, 80);
        p.strokeWeight(2);
        p.noFill();
        drawRingSegment(cx, cy, outerInnerR, outerOuterR, startAngle, endAngle);
      }

      if (isHover) {
        p.stroke(25, 30, 35);
        p.strokeWeight(4);
        p.noFill();
        drawRingSegment(cx, cy, outerInnerR, outerOuterR, startAngle, endAngle);
      }

      drawRainDropsForMonth(
        cx,
        cy,
        outerOuterR - 82,
        outerOuterR - 26,
        startAngle,
        endAngle,
        d,
        i
      );
    }

    // INNER RING:
    // calendar months + official winter reference
    for (let i = 0; i < monthlyData.length; i++) {
      const d = monthlyData[i];
      const centerAngle = -p.HALF_PI + i * seg;
      const startAngle = centerAngle - seg * 0.5;
      const endAngle = centerAngle + seg * 0.5;

      if (isOfficialWinterMonth(i)) {
        p.fill(223, 231, 242);
      } else {
        p.fill(244, 241, 234);
      }

      p.stroke(145, 145, 145);
      p.strokeWeight(1.1);
      drawRingSegment(cx, cy, innerInnerR, innerOuterR, startAngle, endAngle);

      if (isOfficialWinterMonth(i)) {
        drawHatchInSegment(cx, cy, innerInnerR, innerOuterR, startAngle, endAngle);
      }

      const labelR = innerInnerR + 55;
      const lx = cx + p.cos(centerAngle) * labelR;
      const ly = cy + p.sin(centerAngle) * labelR - 10;

      p.noStroke();
      if (isOfficialWinterMonth(i)) {
        p.fill(35, 35, 35);
        p.textStyle(p.BOLD);
      } else {
        p.fill(75, 75, 75);
        p.textStyle(p.NORMAL);
      }

      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text(d.month.toUpperCase(), lx, ly);

      const iconR = innerInnerR + 82;
      const ix = cx + p.cos(centerAngle) * iconR;
      const iy = cy + p.sin(centerAngle) * iconR + 5;

      drawSeasonIcon(i, ix, iy, 0.34);
    }

    p.noStroke();
    p.fill(250, 248, 242);
    p.circle(cx, cy, innerInnerR * 1.92);
  }

  function drawFeltWinterIndicator() {
    const cx = p.width / 2;
    const cy = 620;

    const outerOuterR = 345;
    const seg = p.TWO_PI / 12;

    // Felt winter = Oct–Mar
    // month index: Oct=9, Nov=10, Dec=11, Jan=0, Feb=1, Mar=2
    const startAngle = (-p.HALF_PI + 9 * seg) - seg * 0.48;
    const endAngle = (-p.HALF_PI + 2 * seg) + seg * 0.48;

    const arcR = outerOuterR + 26;

    p.push();
    p.noFill();
    p.stroke(70, 105, 180);
    p.strokeWeight(2.4);
    p.drawingContext.setLineDash([9, 7]);

    drawWrappedArc(cx, cy, arcR, startAngle, endAngle);

    p.drawingContext.setLineDash([]);
    p.pop();

    p.noStroke();
    p.fill(70, 105, 180);
    p.textAlign(p.CENTER, p.CENTER);

    p.textStyle(p.BOLD);
    p.textSize(16);
    p.text("FELT WINTER", cx - 35, cy - arcR - 12);

    p.textStyle(p.NORMAL);
    p.textSize(14);
    p.text("(about 6 months)", cx + 88, cy - arcR - 12);
  }

  function drawWrappedArc(cx, cy, r, startAngle, endAngle) {
    if (endAngle < startAngle) {
      endAngle += p.TWO_PI;
    }

    let current = startAngle;
    while (current < endAngle) {
      const next = p.min(current + 0.04, endAngle);

      const a1 = current % p.TWO_PI;
      const a2 = next % p.TWO_PI;

      if (a2 < a1) {
        p.arc(cx, cy, r * 2, r * 2, a1, p.TWO_PI);
        p.arc(cx, cy, r * 2, r * 2, 0, a2);
      } else {
        p.arc(cx, cy, r * 2, r * 2, a1, a2);
      }

      current = next;
    }
  }

  // =========================
  // Tooltip
  // =========================

  function drawTooltip(d) {
    const boxW = 340;
    const boxH = 245;

    let x = p.mouseX + 20;
    let y = p.mouseY + 20;

    if (x + boxW > p.width - 20) x = p.mouseX - boxW - 20;
    if (y + boxH > p.height - 20) y = p.mouseY - boxH - 20;

    p.noStroke();
    p.fill(255, 255, 255, 248);
    p.rect(x, y, boxW, boxH, 14);

    p.stroke(180);
    p.strokeWeight(1);
    p.noFill();
    p.rect(x, y, boxW, boxH, 14);

    p.noStroke();
    p.fill(30, 30, 30);
    p.textAlign(p.LEFT, p.TOP);

    p.textStyle(p.BOLD);
    p.textSize(23);
    p.text(d.month, x + 18, y + 16);

    p.textStyle(p.NORMAL);
    p.textSize(17);
    p.fill(70);
    p.text("Average daylight: " + p.nf(d.avgDaylight, 1, 1) + " hours", x + 18, y + 56);
    p.text("Total precipitation: " + p.nf(d.totalPrecip, 1, 2) + " in", x + 18, y + 84);
    p.text("Rainy days: " + d.rainyDays + " days", x + 18, y + 112);
    p.text("Average cloud cover: " + p.nf(d.avgCloud, 1, 1) + "%", x + 18, y + 140);
    p.text("Cloudy days ≥75%: " + d.cloudyDays + " days", x + 18, y + 168);
    p.text("Official winter? " + (isOfficialWinterMonth(d.monthNum - 1) ? "Yes" : "No"), x + 18, y + 196);
  }

  // =========================
  // Helper functions
  // =========================

  function drawRingSegment(cx, cy, innerR, outerR, startAngle, endAngle) {
    p.beginShape();

    for (let a = startAngle; a <= endAngle; a += 0.01) {
      p.vertex(cx + p.cos(a) * outerR, cy + p.sin(a) * outerR);
    }

    for (let a = endAngle; a >= startAngle; a -= 0.01) {
      p.vertex(cx + p.cos(a) * innerR, cy + p.sin(a) * innerR);
    }

    p.endShape(p.CLOSE);
  }

  function drawHatchInSegment(cx, cy, innerR, outerR, startAngle, endAngle) {
    p.push();
    p.stroke(170, 175, 185, 115);
    p.strokeWeight(1);

    for (let r = innerR + 10; r < outerR; r += 12) {
      const a1 = startAngle + 0.03;
      const a2 = endAngle - 0.03;
      const x1 = cx + p.cos(a1) * r;
      const y1 = cy + p.sin(a1) * r;
      const x2 = cx + p.cos(a2) * (r + 25);
      const y2 = cy + p.sin(a2) * (r + 25);
      p.line(x1, y1, x2, y2);
    }

    p.pop();
  }

  function drawRainDropsForMonth(cx, cy, minR, maxR, startAngle, endAngle, d, seedValue) {
    p.randomSeed(seedValue * 300);

    const precip = d.totalPrecip;

    const dropsToDraw = p.constrain(
      p.floor(p.map(precip, 0, 6, 0, 12)),
      0,
      12
    );

    const dropSize = p.map(precip, 0, 6, 5.2, 7.8);

    for (let j = 0; j < dropsToDraw; j++) {
      const a = p.random(startAngle + 0.10, endAngle - 0.10);
      const r = p.random(minR, maxR);

      const x = cx + p.cos(a) * r;
      const y = cy + p.sin(a) * r;

      drawRaindrop(x, y, dropSize);
    }
  }

  function drawRaindrop(x, y, s) {
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.fill(220, 235, 248, 185);

    p.beginShape();
    p.vertex(0, -s);
    p.bezierVertex(s * 0.65, -s * 0.15, s * 0.8, s * 0.7, 0, s);
    p.bezierVertex(-s * 0.8, s * 0.7, -s * 0.65, -s * 0.15, 0, -s);
    p.endShape(p.CLOSE);

    p.pop();
  }

  function drawCloudIcon(x, y, scale) {
    p.push();
    p.translate(x, y);
    p.scale(scale);

    p.noStroke();
    p.fill(220, 224, 230, 185);
    p.ellipse(-16, 0, 30, 22);
    p.ellipse(0, -8, 38, 28);
    p.ellipse(18, 0, 30, 22);
    p.rect(-24, 0, 48, 14, 8);

    p.pop();
  }

  function drawSunCloudIcon(x, y, scale) {
    p.push();
    p.translate(x, y);
    p.scale(scale);

    p.noStroke();
    p.fill(244, 196, 92, 190);
    p.circle(-10, -10, 18);

    p.fill(225, 229, 234, 190);
    p.ellipse(-4, 2, 24, 18);
    p.ellipse(10, -4, 30, 22);
    p.ellipse(24, 2, 24, 18);
    p.rect(-10, 2, 36, 12, 6);

    p.pop();
  }

  function drawSunIcon(x, y, scale) {
    p.push();
    p.translate(x, y);
    p.scale(scale);

    p.noStroke();
    p.fill(244, 196, 92, 200);
    p.circle(0, 0, 20);

    p.stroke(244, 196, 92, 180);
    p.strokeWeight(2);
    for (let a = 0; a < p.TWO_PI; a += p.PI / 4) {
      const x1 = p.cos(a) * 14;
      const y1 = p.sin(a) * 14;
      const x2 = p.cos(a) * 22;
      const y2 = p.sin(a) * 22;
      p.line(x1, y1, x2, y2);
    }

    p.pop();
  }

  function drawSeasonIcon(monthIndex, x, y, scale) {
    if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) {
      drawCloudIcon(x, y, scale);
    } else if (monthIndex >= 2 && monthIndex <= 4) {
      drawSunCloudIcon(x, y, scale);
    } else if (monthIndex >= 5 && monthIndex <= 7) {
      drawSunIcon(x, y, scale);
    } else {
      drawCloudIcon(x, y, scale);
    }
  }

  function drawArrow(x1, y1, x2, y2) {
    p.line(x1, y1, x2, y2);

    const angle = p.atan2(y2 - y1, x2 - x1);
    const arrowSize = 8;

    p.push();
    p.translate(x2, y2);
    p.rotate(angle);
    p.line(0, 0, -arrowSize, -arrowSize / 2);
    p.line(0, 0, -arrowSize, arrowSize / 2);
    p.pop();
  }

  function getDaylightColor(daylight) {
    const dark = p.color(52, 64, 98);
    const mid = p.color(118, 145, 171);
    const light = p.color(238, 200, 111);

    if (daylight < 12) {
      return p.lerpColor(dark, mid, p.map(daylight, 8.5, 12, 0, 1));
    } else {
      return p.lerpColor(mid, light, p.map(daylight, 12, 16, 0, 1));
    }
  }

  function isOfficialWinterMonth(i) {
    return i === 11 || i === 0 || i === 1;
  }

  function isFeltWinterMonth(i) {
    return i === 9 || i === 10 || i === 11 || i === 0 || i === 1 || i === 2;
  }

  function getHoveredMonth(cx, cy, innerR, outerR) {
    const dx = p.mouseX - cx;
    const dy = p.mouseY - cy;
    const r = p.sqrt(dx * dx + dy * dy);

    if (r < innerR || r > outerR) return null;

    let a = p.atan2(dy, dx);
    a = a + p.HALF_PI;

    if (a < 0) a += p.TWO_PI;

    const seg = p.TWO_PI / 12;
    const index = p.floor((a + seg / 2) / seg) % 12;

    return index;
  }
});