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

  // ── Tree sprite (row 5 col 1 on sheet) ───────────────────────────────────
  const TREE_SX = 32;
  const TREE_SY = 160;

  let treeCanvas = null;

  function spawnTree(screenX) {
    if (treeCanvas) treeCanvas.remove();
    treeCanvas = document.createElement('canvas');
    treeCanvas.width  = FRAME_W * SCALE;
    treeCanvas.height = FRAME_H * SCALE;
    treeCanvas.style.cssText =
      `position:fixed;bottom:${8}px;left:${screenX}px;` +
      `image-rendering:pixelated;z-index:998;pointer-events:none;`;
    const tc = treeCanvas.getContext('2d');
    tc.imageSmoothingEnabled = false;
    sheet.onload = () => {
      tc.drawImage(sheet, TREE_SX, TREE_SY, FRAME_W, FRAME_H,
                   0, 0, FRAME_W * SCALE, FRAME_H * SCALE);
    };
    if (loaded) {
      tc.drawImage(sheet, TREE_SX, TREE_SY, FRAME_W, FRAME_H,
                   0, 0, FRAME_W * SCALE, FRAME_H * SCALE);
    }
    document.body.appendChild(treeCanvas);
  }

  function removeTree() {
    if (treeCanvas) { treeCanvas.remove(); treeCanvas = null; }
  }

  // ── Beaver state ──────────────────────────────────────────────────────────
  let state       = 'idle';
  let tick        = 0;
  let busyTicks   = 0;
  let busyRow     = ROWS.BITE;
  let scurrying   = false;
  let scurryX     = 0;
  let scurryPhase = 'run'; // 'run' | 'chop' | 'resume'
  let chopTicks   = 0;
  let treeStopX   = -1;
  const CHOP_DURATION = 72;

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
      if (scurryPhase === 'run') {
        scurryX += 3;
        container.style.left = scurryX + 'px';
        drawFrame(ROWS.MOVE_STICK, frameAt(tick));

        if (treeStopX >= 0 && scurryX >= treeStopX) {
          scurryPhase = 'chop';
          chopTicks   = 0;
          tick        = 0;
        } else if (scurryX > window.innerWidth + 64) {
          removeTree();
          scurrying   = false;
          scurryPhase = 'run';
          treeStopX   = -1;
          container.style.left   = 'auto';
          container.style.right  = '16px';
          container.style.bottom = '8px';
          state = 'idle';
          tick  = 0;
          scheduleScurry();
        }

      } else if (scurryPhase === 'chop') {
        drawFrame(ROWS.BITE, frameAt(tick));
        chopTicks++;
        if (chopTicks >= CHOP_DURATION) {
          removeTree();
          scurryPhase = 'resume';
          tick        = 0;
        }

      } else {
        // resume running
        scurryX += 3;
        container.style.left = scurryX + 'px';
        drawFrame(ROWS.MOVE_STICK, frameAt(tick));

        if (scurryX > window.innerWidth + 64) {
          scurrying   = false;
          scurryPhase = 'run';
          treeStopX   = -1;
          container.style.left   = 'auto';
          container.style.right  = '16px';
          container.style.bottom = '8px';
          state = 'idle';
          tick  = 0;
          scheduleScurry();
        }
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
    scurrying   = true;
    scurryPhase = 'run';
    chopTicks   = 0;
    scurryX     = -canvas.width;
    container.style.bottom = '8px';
    container.style.right  = 'auto';

    // 50% chance to stop at a tree somewhere in the middle third of the screen
    if (Math.random() < 0.5) {
      const minX = Math.floor(window.innerWidth * 0.25);
      const maxX = Math.floor(window.innerWidth * 0.65);
      treeStopX = minX + Math.floor(Math.random() * (maxX - minX));
      spawnTree(treeStopX);
    } else {
      treeStopX = -1;
    }
  }

  function scheduleScurry() {
    setTimeout(startScurry, 20000 + Math.random() * 25000);
  }

  // ── Hook into task actions ────────────────────────────────────────────────
  const addForm = document.querySelector('form[action="/add"]');
  if (addForm) addForm.addEventListener('submit', () => triggerBusy(ROWS.BITE));

  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => triggerBusy(ROWS.BITE));
  });

  document.querySelectorAll('.delete-btn').forEach(el => {
    el.addEventListener('click', () => triggerBusy(ROWS.DAMAGE));
  });

  canvas.addEventListener('click', () => triggerBusy(ROWS.BITE));
  canvas.style.cursor = 'pointer';

  window.beaverHelp = () => triggerBusy(ROWS.BITE);

  // ── Start ─────────────────────────────────────────────────────────────────
  requestAnimationFrame(loop);
  scheduleScurry();

})();
