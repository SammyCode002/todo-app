(function () {
  'use strict';

  const SCALE = 3;
  const CW    = 36;
  const CH    = 56;

  const canvas = document.getElementById('plant-canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = CW * SCALE;
  canvas.height = CH * SCALE;
  ctx.imageSmoothingEnabled = false;

  let plantCount = Math.min(parseInt(localStorage.getItem('bb_plant') || '0'), 99);

  function getStage(n) {
    if (n === 0)  return 0;
    if (n === 1)  return 1;
    if (n <= 3)   return 2;
    if (n <= 6)   return 3;  // first flowers
    if (n <= 10)  return 4;
    if (n <= 15)  return 5;
    return 6;                // full bloom
  }

  function px(x, y, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
  }

  function drawPot() {
    // Soil
    px(5,  36, '#5a3010', 26, 1);
    px(5,  37, '#3d2008', 26, 2);
    // Rim
    px(4,  39, '#a8dff0', 28, 1);
    px(4,  40, '#7ec8e3', 28, 2);
    // Body trapezoid
    const widths = [26, 26, 24, 24, 22, 20, 18, 16, 14];
    widths.forEach((w, i) => {
      const x = 4 + Math.floor((28 - w) / 2);
      px(x, 42 + i, '#5bb8d4', w, 1);
    });
    // Highlight
    px(5, 42, '#a8dff0', 2, 8);
    // Bottom
    px(11, 51, '#3a8aaa', 14, 1);
  }

  function drawStem(topY, bottomY = 35) {
    for (let y = topY; y <= bottomY; y++) {
      px(17, y, '#4a8c3f', 2, 1);
      px(18, y, '#2d5e28', 1, 1);
    }
  }

  function leafR(x, y) {
    px(x,   y,   '#3a8c35', 5, 1);
    px(x+1, y-1, '#52b847', 4, 1);
    px(x+2, y-2, '#7dd672', 3, 1);
    px(x,   y+1, '#2d6b2d', 4, 1);
  }

  function leafL(x, y) {
    px(x-5, y,   '#3a8c35', 5, 1);
    px(x-5, y-1, '#52b847', 4, 1);
    px(x-5, y-2, '#7dd672', 3, 1);
    px(x-4, y+1, '#2d6b2d', 4, 1);
  }

  // Small pink flower cluster like the reference
  function flower(x, y) {
    px(x+1, y,   '#f5c0d0', 1, 1); // top petal
    px(x,   y+1, '#f5c0d0', 1, 1); // left petal
    px(x+2, y+1, '#f5c0d0', 1, 1); // right petal
    px(x+1, y+2, '#f5c0d0', 1, 1); // bottom petal
    px(x+1, y+1, '#d04060', 1, 1); // center
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPot();

    const stage = getStage(plantCount);
    if (stage === 0) return;

    // Stage 1: tiny sprout
    if (stage === 1) {
      drawStem(33, 35);
      return;
    }

    // Stage 2: small plant, no flowers
    if (stage === 2) {
      drawStem(27, 35);
      leafR(19, 30); leafL(17, 30);
      return;
    }

    // Stage 3: medium plant, first flowers
    if (stage === 3) {
      drawStem(22, 35);
      leafR(19, 30); leafL(17, 30);
      leafR(19, 25); leafL(17, 25);
      flower(19, 21);
      flower(11, 27);
      return;
    }

    // Stage 4: taller, more flowers
    if (stage === 4) {
      drawStem(17, 35);
      leafR(19, 30); leafL(17, 30);
      leafR(19, 25); leafL(17, 25);
      leafR(19, 20); leafL(17, 20);
      flower(21, 22);
      flower(11, 27);
      flower(20, 16);
      flower(12, 21);
      return;
    }

    // Stage 5: full plant, scattered flowers
    if (stage === 5) {
      drawStem(12, 35);
      leafR(19, 30); leafL(17, 30);
      leafR(19, 25); leafL(17, 25);
      leafR(19, 20); leafL(17, 20);
      leafR(19, 15); leafL(17, 15);
      flower(21, 27);
      flower(11, 27);
      flower(21, 22);
      flower(11, 21);
      flower(20, 16);
      flower(12, 15);
      flower(17, 11);
      return;
    }

    // Stage 6: full bloom
    drawStem(8, 35);
    leafR(19, 30); leafL(17, 30);
    leafR(19, 25); leafL(17, 25);
    leafR(19, 20); leafL(17, 20);
    leafR(19, 15); leafL(17, 15);
    leafR(19, 10); leafL(17, 10);
    flower(21, 27); flower(11, 27);
    flower(22, 22); flower(10, 22);
    flower(21, 17); flower(11, 17);
    flower(20, 12); flower(12, 12);
    flower(17,  7);
  }

  function grow() {
    plantCount++;
    localStorage.setItem('bb_plant', plantCount);
    draw();
  }

  function wilt() {
    if (plantCount > 0) {
      plantCount = Math.max(0, plantCount - 1);
      localStorage.setItem('bb_plant', plantCount);
      draw();
    }
  }

  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.task-card');
      if (card && card.dataset.done === 'false') grow();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => wilt());
  });

  draw();
})();
