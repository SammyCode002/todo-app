(function () {
  'use strict';

  // ── Sprite sheet layout ───────────────────────────────────────────────────
  const FRAME_W         = 32;
  const FRAME_H         = 32;
  const SCALE           = 2;
  const TICKS_PER_FRAME = 6;
  const FRAMES          = 4;

  const ROWS = {
    IDLE:       0,
    MOVEMENT:   32,
    MOVE_STICK: 64,
    BITE:       96,
    DAMAGE:     128,
  };

  // ── Beaver canvas ─────────────────────────────────────────────────────────
  const container  = document.getElementById('beaver-container');
  const canvas     = document.getElementById('beaver-canvas');
  const ctx        = canvas.getContext('2d');

  canvas.width  = FRAME_W * SCALE;
  canvas.height = FRAME_H * SCALE;
  ctx.imageSmoothingEnabled = false;

  const sheet  = new Image();
  sheet.src    = '/static/img/beaver_spritesheet.png';
  let loaded   = false;
  sheet.onload = () => { loaded = true; };

  // ── Log pile canvas ───────────────────────────────────────────────────────
  const LOG_MAX    = 8;
  const LOG_W      = 20;   // canvas pixels wide
  const LOG_H      = 5;    // pixels per log
  const LOG_GAP    = 1;    // gap between logs
  const PILE_H     = LOG_MAX * (LOG_H + LOG_GAP);

  const logWrap    = document.getElementById('log-pile-wrap');
  const logCanvas  = document.getElementById('log-pile-canvas');
  const logCtx     = logCanvas.getContext('2d');

  logCanvas.width  = LOG_W;
  logCanvas.height = PILE_H;
  logCanvas.style.imageRendering = 'pixelated';

  // ── Log count (persisted) ─────────────────────────────────────────────────
  let logCount = Math.min(parseInt(localStorage.getItem('bb_logs') || '0'), LOG_MAX);

  function drawLogs() {
    logCtx.clearRect(0, 0, LOG_W, PILE_H);
    for (let i = 0; i < logCount; i++) {
      const y = PILE_H - (i + 1) * (LOG_H + LOG_GAP);
      // end grain (left + right)
      logCtx.fillStyle = '#6b4830';
      logCtx.fillRect(0, y, 2, LOG_H);
      logCtx.fillRect(LOG_W - 2, y, 2, LOG_H);
      // body
      logCtx.fillStyle = '#8b6040';
      logCtx.fillRect(2, y, LOG_W - 4, LOG_H);
      // highlight top edge
      logCtx.fillStyle = '#c4a882';
      logCtx.fillRect(2, y, LOG_W - 4, 1);
      // shadow bottom edge
      logCtx.fillStyle = '#4a2810';
      logCtx.fillRect(2, y + LOG_H - 1, LOG_W - 4, 1);
    }
    logWrap.classList.toggle('full', logCount >= LOG_MAX);
  }

  function addLog() {
    if (logCount >= LOG_MAX) return;
    logCount++;
    localStorage.setItem('bb_logs', logCount);
    drawLogs();
  }

  function clearLogs() {
    if (logCount === 0) return;
    logCount = 0;
    localStorage.setItem('bb_logs', '0');
    drawLogs();
    triggerBusy(ROWS.BITE);
  }

  logWrap.addEventListener('click', clearLogs);

  // ── Beaver state ──────────────────────────────────────────────────────────
  let state      = 'idle';
  let tick       = 0;
  let busyTicks  = 0;
  let busyRow    = ROWS.BITE;
  let scurrying  = false;
  let scurryX    = 0;

  function drawFrame(row, frameIndex) {
    if (!loaded) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      sheet,
      frameIndex * FRAME_W, row,
      FRAME_W, FRAME_H,
      0, 0,
      FRAME_W * SCALE, FRAME_H * SCALE
    );
  }

  function frameAt(t) {
    return Math.floor(t / TICKS_PER_FRAME) % FRAMES;
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  function loop() {
    tick++;

    if (scurrying) {
      scurryX += 3;
      container.style.left  = scurryX + 'px';
      container.style.right = 'auto';
      drawFrame(ROWS.MOVE_STICK, frameAt(tick));

      if (scurryX > window.innerWidth + 64) {
        scurrying = false;
        container.style.left   = 'auto';
        container.style.right  = '16px';
        container.style.bottom = '8px';
        state     = 'idle';
        tick      = 0;
        scheduleScurry();
      }

    } else if (state === 'busy') {
      drawFrame(busyRow, frameAt(tick));
      busyTicks++;
      if (busyTicks > 48) {
        state     = 'idle';
        busyTicks = 0;
        tick      = 0;
      }

    } else {
      drawFrame(ROWS.IDLE, frameAt(tick));
    }

    requestAnimationFrame(loop);
  }

  // ── Trigger busy animation ────────────────────────────────────────────────
  function triggerBusy(row) {
    if (scurrying) return;
    busyRow   = row || ROWS.BITE;
    state     = 'busy';
    busyTicks = 0;
    tick      = 0;
  }

  // ── Scurry ────────────────────────────────────────────────────────────────
  function startScurry() {
    if (state !== 'idle') { scheduleScurry(); return; }
    scurrying = true;
    scurryX   = -canvas.width;
    container.style.bottom = '8px';
  }

  function scheduleScurry() {
    setTimeout(startScurry, 20000 + Math.random() * 25000);
  }

  // ── Hook into task actions ────────────────────────────────────────────────
  const addForm = document.querySelector('form[action="/add"]');
  if (addForm) addForm.addEventListener('submit', () => triggerBusy(ROWS.BITE));

  // Only add a log when completing (not un-completing)
  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => {
      const card = el.closest('.task-card');
      const completing = card && card.dataset.done === 'false';
      triggerBusy(ROWS.BITE);
      if (completing) addLog();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => triggerBusy(ROWS.DAMAGE));
  });

  canvas.addEventListener('click', () => triggerBusy(ROWS.BITE));
  canvas.style.cursor = 'pointer';

  // ── Start ─────────────────────────────────────────────────────────────────
  drawLogs();
  requestAnimationFrame(loop);
  scheduleScurry();

})();
