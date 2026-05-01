// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  let shake = 0;

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.angleMode(p.DEGREES);
    p.textFont("Arial");
  };

  p.draw = function () {
    let h = p.hour();
    let m = p.minute();
    let s = p.second();

    p.background(250, 238, 220);

    if (shake > 0) {
      shake *= 0.9;
    }

    let offsetX = p.random(-shake, shake);

    p.push();
    p.translate(offsetX, 0);

    // Cup settings
    let cupTopY = 150;
    let cupBottomY = 620;
    let cupLeftTop = 250;
    let cupRightTop = 550;
    let cupLeftBottom = 295;
    let cupRightBottom = 505;

    // Cup outline
    p.stroke(60);
    p.strokeWeight(6);
    p.fill(255, 245, 230, 120);
    p.quad(
      cupLeftTop,
      cupTopY,
      cupRightTop,
      cupTopY,
      cupRightBottom,
      cupBottomY,
      cupLeftBottom,
      cupBottomY
    );

    // Minute = milk tea liquid height
    // 0 minute = lower level, 59 minutes = higher level
    let liquidTopY = p.map(m, 0, 59, cupBottomY - 140, cupTopY + 70);

    // Drink liquid shape
    p.noStroke();
    p.fill(210, 160, 105, 220);
    p.quad(
      p.map(liquidTopY, cupTopY, cupBottomY, cupLeftTop + 15, cupLeftBottom + 5),
      liquidTopY,
      p.map(liquidTopY, cupTopY, cupBottomY, cupRightTop - 15, cupRightBottom - 5),
      liquidTopY,
      cupRightBottom - 15,
      cupBottomY - 20,
      cupLeftBottom + 15,
      cupBottomY - 20
    );

    // Liquid surface
    p.fill(255, 235, 205, 130);
    p.ellipse(400, liquidTopY, 235, 26);

    // Brown sugar layer at bottom
    p.noStroke();
    p.fill(120, 70, 35, 130);
    p.quad(315, 545, 485, 545, 500, 600, 300, 600);

    // Boba pearls at bottom
    drawBobaPearls(s);

    // Bubbles rise with seconds
    drawBubbles(s, liquidTopY);

    // L-shaped straw as clock hands
    // The bend point is inside the cup, but the long straw extends outside.
    drawLStraw(h, m);

    // Cup rim on top
    // This is drawn after the straw so it looks like the straw goes through the cup opening.
    p.noFill();
    p.stroke(60);
    p.strokeWeight(5);
    p.ellipse(400, cupTopY, 305, 36);

    p.pop();

    // Title
    p.noStroke();
    p.fill(50);
    p.textAlign(p.CENTER);
    p.textSize(48);
    p.text("Boba Clock", p.width / 2, 710);

    // Canvas frame
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  function drawLStraw(h, m) {
  // Bend point is at the lowest point of the straw, inside the cup
  let pivotX = 400;
  let pivotY = 520;

  // Long straw angle = hour
  // This long part extends from the low bend point to outside the cup.
  let hourAngle = p.map((h % 12) + m / 60, 0, 12, -30, 30);

  // Short bent part = minute
  // This rotates from the bottom bend point inside the cup.
  let minuteAngle = p.map(m, 0, 59, -140, -40);

  p.push();
  p.translate(pivotX, pivotY);

  // -----------------------------
  // Long straw segment
  // From bottom bend point upward and outside the cup
  // -----------------------------
  p.push();
  p.rotate(hourAngle);

  // Outer dark edge
  p.stroke(70);
  p.strokeWeight(18);
  p.line(0, 0, 0, -455);

  // Pink straw body
  p.stroke(255, 165, 185);
  p.strokeWeight(10);
  p.line(0, 0, 0, -455);

  p.pop();

  // -----------------------------
  // Short L-shaped segment
  // Connected at the lowest bend point
  // -----------------------------
  p.push();
  p.rotate(minuteAngle);

  p.stroke(70);
  p.strokeWeight(18);
  p.line(0, 0, 110, 0);

  p.stroke(255, 165, 185);
  p.strokeWeight(10);
  p.line(0, 0, 110, 0);

  p.pop();

  // Bend joint at the lowest point
  p.noStroke();
  p.fill(255, 165, 185);
  p.circle(0, 0, 24);

  p.stroke(70);
  p.strokeWeight(3);
  p.noFill();
  p.circle(0, 0, 26);

  p.pop();
}
  
  function drawBobaPearls(sec) {
    p.noStroke();

    let pearlPositions = [
      [330, 575],
      [365, 585],
      [400, 570],
      [435, 585],
      [470, 575],
      [345, 535],
      [385, 545],
      [425, 535],
      [455, 548],
      [360, 500],
      [405, 505],
      [445, 500]
    ];

    for (let i = 0; i < pearlPositions.length; i++) {
      let x = pearlPositions[i][0];
      let y = pearlPositions[i][1];

      // Tiny second-based bounce
      let bounce = p.sin(sec * 6 + i * 20) * 2;

      p.fill(50, 30, 22);
      p.circle(x, y + bounce, 25);

      // Pearl highlight
      p.fill(255, 255, 255, 60);
      p.circle(x - 5, y - 5 + bounce, 7);
    }
  }

  function drawBubbles(sec, liquidTopY) {
    p.noStroke();
    p.fill(255, 255, 255, 130);

    for (let i = 0; i < 9; i++) {
      let x = 310 + i * 22;
      let y = 585 - ((sec * 6 + i * 37) % 260);

      // Only show bubbles inside the liquid area
      if (y > liquidTopY + 10 && y < 600) {
        p.circle(x, y, 9);
      }
    }
  }

  p.mousePressed = function () {
    shake = 12;
  };

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});