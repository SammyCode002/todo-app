(function () {
  'use strict';

  const SCALE = 3;
  const CW    = 32;
  const CH    = 52;

  const canvas = document.getElementById('plant-canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = CW * SCALE;
  canvas.height = CH * SCALE;
  ctx.imageSmoothingEnabled = false;

  let plantCount = Math.min(parseInt(localStorage.getItem('bb_plant') || '0'), 99);

  function getStage(n) {
    if (n === 0)  return 0;
    if (n <= 2)   return 1;
    if (n <= 5)   return 2;
    if (n <= 9)   return 3;
    if (n <= 14)  return 4;
    if (n <= 20)  return 5;
    if (n <= 27)  return 6;
    if (n <= 35)  return 7;
    return 8;
  }

  function px(x, y, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
  }

  function drawPot() {
    // Soil
    px(5,  33, '#5a3010', 22, 1);
    px(5,  34, '#3d2008', 22, 2);

    // Pot rim
    px(4,  36, '#a8dff0', 24, 1);
    px(4,  37, '#7ec8e3', 24, 2);

    // Pot body (trapezoid)
    const rows = [22, 22, 20, 20, 18, 18, 16, 14, 12];
    rows.forEach((w, i) => {
      const x = 4 + Math.floor((24 - w) / 2);
      px(x, 39 + i, '#5bb8d4', w, 1);
    });

    // Left highlight
    px(5, 39, '#a8dff0', 2, 7);

    // Bottom
    px(10, 48, '#3a8aaa', 12, 1);
  }

  function drawStem(topY, bottomY = 32) {
    for (let y = topY; y <= bottomY; y++) {
      px(15, y, '#4a8c3f', 2, 1);
      px(16, y, '#2d5e28', 1, 1);
    }
  }

  function leafR(x, y) {
    px(x,   y,   '#52b847', 4, 1);
    px(x+1, y-1, '#7dd672', 3, 1);
    px(x+2, y-2, '#7dd672', 2, 1);
    px(x,   y+1, '#2d6b2d', 3, 1);
  }

  function leafL(x, y) {
    px(x-4, y,   '#52b847', 4, 1);
    px(x-4, y-1, '#7dd672', 3, 1);
    px(x-4, y-2, '#7dd672', 2, 1);
    px(x-2, y+1, '#2d6b2d', 3, 1);
  }

  function drawFlowerBud(x, y) {
    px(x,   y,   '#e8c840', 3, 1);
    px(x,   y-1, '#f5e080', 3, 1);
    px(x+1, y-2, '#f5e080', 1, 1);
  }

  function drawFlower(x, y) {
    px(x-1, y-2, '#f5c842', 5, 1);
    px(x-2, y-1, '#f5c842', 1, 2);
    px(x+3, y-1, '#f5c842', 1, 2);
    px(x,   y-1, '#fff176', 3, 2);
    px(x+1, y,   '#e8a800', 1, 1);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPot();

    const stage = getStage(plantCount);
    if (stage === 0) return;

    const stemTops = [30, 26, 21, 16, 12, 8, 6, 5];
    drawStem(stemTops[Math.min(stage - 1, stemTops.length - 1)]);

    if (stage >= 2) { leafR(17, 28); leafL(15, 28); }
    if (stage >= 3) { leafR(17, 23); leafL(15, 23); }
    if (stage >= 4) { leafR(17, 18); leafL(15, 18); }
    if (stage >= 5) { leafR(17, 13); leafL(15, 13); }
    if (stage === 6) drawFlowerBud(14, 9);
    if (stage === 7) drawFlowerBud(14, 7);
    if (stage >= 8)  drawFlower(13, 7);
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

  // Hook into task actions
  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.task-card');
      const completing = card && card.dataset.done === 'false';
      if (completing) grow();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => wilt());
  });

  draw();
})();
