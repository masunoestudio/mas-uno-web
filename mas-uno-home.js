
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cells = [], dpr = 1, width = 0, height = 0;
    let frameId = null, lastFrame = performance.now();
    const pointer = { x: -1000, y: -1000, movedAt: -Infinity, active: false };
    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = values => values[Math.floor(Math.random() * values.length)];
    const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t);
    const smooth = t => t * t * (3 - 2 * t);
    const white = [255, 255, 255];
    const shades = [0, 70, 130, 170, 205, 225, 245, 255, 255];
    // Latest user-provided palette in ASISTENTE GRÀFICO.
    const paletteHex = [
      '#458000', '#4B8400', '#518800', '#588C00', '#5F9100', '#669500',
      '#6E9900', '#759D00', '#7DA200', '#85A600', '#8DAA00', '#96AE00',
      '#9EB300', '#A7B700', '#B0BA00', '#B9BE00', '#C2C100', '#C6C000',
      '#C9BD00', '#CDBB00', '#D1B800', '#D5B600', '#D8B300', '#DCAF00',
      '#E0AC00', '#E3A900', '#E7A500', '#EAA100', '#EE9D01', '#F29801',
      '#F59402', '#F78B0B', '#F88414', '#F97D1F', '#FB7729', '#FC7133',
      '#FD6D3D', '#FE6A47', '#FF6852', '#FF675C', '#FF6766', '#FF7070',
      '#FF7A7E', '#FF858F', '#FF8F9E', '#FF99AD', '#FFA3BB', '#FFADC7',
      '#FFB8D3', '#FFC2DD', '#FFCCE6'
    ];
    const palette = paletteHex.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth; height = hero.clientHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      if (reducedMotion.matches) frame(performance.now());
    }

    function buildGrid() {
      const gap = Math.max(38, Math.min(78, Math.round(Math.min(width, height) / 9)));
      const arm = Math.max(7, Math.min(17, gap * 0.20));
      cells = [];
      const columns = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const offsetX = (width - (columns - 1) * gap) / 2;
      const offsetY = (height - (rows - 1) * gap) / 2;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          cells.push({ x: offsetX + column * gap, y: offsetY + row * gap, arm,
            accent: false, reactive: Math.random() < .30, hover: 0,
            color: [...white], from: [...white], to: [...white], display: [...white],
            paletteIndex: Math.floor(rand(0, palette.length)), hoverShade: pick([70, 180, 255]),
            start: 0, duration: 0, next: 0 });
        }
      }
      // A fixed, shuffled pool guarantees that no more than 10% can carry color,
      // including during overlapping pointer trails and color transitions.
      const shuffled = [...cells];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand(0, i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      shuffled.slice(0, Math.floor(cells.length * .10)).forEach(c => { c.accent = true; });
      const now = performance.now();
      cells.forEach(c => {
        schedule(c, now);
        if (reducedMotion.matches) c.color = c.display = [...c.to];
      });
    }

    function schedule(c, now) {
      c.from = [...c.color];
      const shade = pick(shades);
      c.to = [shade, shade, shade];
      c.paletteIndex = Math.floor(rand(0, palette.length));
      if (c.accent && Math.random() < .75) c.to = mix(palette[c.paletteIndex], white, .24);
      c.start = now + rand(200, 1300);
      c.duration = rand(1000, 1700);
      c.next = c.start + c.duration + rand(1800, 3800);
    }

    function drawPlus(c) {
      ctx.fillStyle = `rgb(${c.display.map(Math.round).join(',')})`;
      ctx.beginPath();
      ctx.rect(c.x - c.arm, c.y - c.arm * 0.21, c.arm * 2, c.arm * 0.42);
      ctx.rect(c.x - c.arm * 0.21, c.y - c.arm, c.arm * 0.42, c.arm * 2);
      ctx.fill();
    }

    function frame(now) {
      ctx.clearRect(0, 0, width, height);
      const dt = Math.min(64, Math.max(0, now - lastFrame));
      lastFrame = now;
      const radius = Math.max(90, Math.min(170, width * .16));
      const motion = pointer.active ? Math.exp(-Math.max(0, now - pointer.movedAt) / 650) : 0;
      for (const c of cells) {
        if (!reducedMotion.matches) {
          const t = Math.max(0, Math.min(1, (now - c.start) / c.duration));
          c.color = mix(c.from, c.to, smooth(t));
          if (now >= c.next) schedule(c, now);
          const distance = Math.hypot(c.x - pointer.x, c.y - pointer.y);
          const proximity = Math.max(0, 1 - distance / radius);
          const targetHover = (c.accent || c.reactive) ? smooth(proximity) * motion : 0;
          const response = 1 - Math.exp(-dt / (targetHover > c.hover ? 110 : 850));
          c.hover += (targetHover - c.hover) * response;
          const index = Math.min(palette.length - 1, Math.max(0, Math.floor(pointer.x / width * palette.length)));
          const interactionColor = c.accent ? palette[index] : [c.hoverShade, c.hoverShade, c.hoverShade];
          const target = mix(c.color, interactionColor, c.hover);
          c.display = mix(c.display, target, 1 - Math.exp(-dt / 160));
        }
        drawPlus(c);
      }
      frameId = null;
      if (!reducedMotion.matches && !document.hidden) frameId = requestAnimationFrame(frame);
    }

    hero.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const bounds = hero.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.movedAt = performance.now();
      pointer.active = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; });
    hero.addEventListener('pointercancel', () => { pointer.active = false; });
    window.addEventListener('scroll', () => { pointer.active = false; }, { passive: true });
    function syncMotion() {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      pointer.active = false;
      lastFrame = performance.now();
      if (reducedMotion.matches) resize();
      else if (!document.hidden) frameId = requestAnimationFrame(frame);
    }
    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    window.addEventListener('resize', resize);
    resize();
    syncMotion();

