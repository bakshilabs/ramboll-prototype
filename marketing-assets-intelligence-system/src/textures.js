import * as THREE from 'three';
import { BRANDS, TYPES, rng } from './data.js';

const SANS = 'Inter, system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

export const TYPE_ASPECT = {
  poster: 0.75, social: 1, slide: 16 / 9, video: 16 / 9, page: 0.72,
  model: 1, material: 0.72, drawing: 4 / 3, logo: 1, photo: 1.5,
};

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function mix(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  return '#' + ca.lerp(cb, t).getHexString();
}

function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Abstract studio marks drawn from architectural elements.
export function drawMark(g, kind, cx, cy, s, col) {
  g.save();
  g.fillStyle = col; g.strokeStyle = col;
  g.lineWidth = Math.max(1, s * 0.12);
  g.beginPath();
  switch (kind) {
    case 'circle':
      g.arc(cx, cy, s * 0.42, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.rect(cx - s * 0.5, cy - s * 0.04, s, s * 0.08); g.fill();
      break;
    case 'arch':
      g.moveTo(cx - s * 0.42, cy + s * 0.5); g.lineTo(cx - s * 0.42, cy);
      g.arc(cx, cy, s * 0.42, Math.PI, 0);
      g.lineTo(cx + s * 0.42, cy + s * 0.5);
      g.lineTo(cx + s * 0.2, cy + s * 0.5); g.lineTo(cx + s * 0.2, cy);
      g.arc(cx, cy, s * 0.2, 0, Math.PI, true);
      g.lineTo(cx - s * 0.2, cy + s * 0.5); g.closePath(); g.fill();
      break;
    case 'stair':
      for (let k = 0; k < 4; k++) g.rect(cx - s * 0.5 + k * s * 0.25, cy + s * 0.5 - (k + 1) * s * 0.25, s * 0.25, (k + 1) * s * 0.25);
      g.fill();
      break;
    case 'slab':
      g.rect(cx - s * 0.5, cy - s * 0.32, s * 0.8, s * 0.14);
      g.rect(cx - s * 0.3, cy - s * 0.04, s * 0.8, s * 0.14);
      g.rect(cx - s * 0.5, cy + s * 0.24, s * 0.8, s * 0.14);
      g.fill();
      break;
    case 'columns':
      g.rect(cx - s * 0.5, cy - s * 0.5, s, s * 0.12);
      for (let k = 0; k < 4; k++) g.rect(cx - s * 0.44 + k * s * 0.28, cy - s * 0.32, s * 0.1, s * 0.82);
      g.fill();
      break;
    case 'frame':
      g.rect(cx - s * 0.45, cy - s * 0.45, s * 0.9, s * 0.9); g.stroke();
      g.beginPath(); g.rect(cx - s * 0.12, cy - s * 0.45, s * 0.24, s * 0.9); g.fill();
      break;
  }
  g.restore();
}

function bars(g, x, y, w, rows, col, h = 6, gap = 6, r = rng(7)) {
  g.fillStyle = col;
  for (let i = 0; i < rows; i++) {
    const ww = w * (i === rows - 1 ? 0.45 + r() * 0.2 : 0.75 + r() * 0.25);
    rr(g, x, y + i * (h + gap), ww, h, Math.min(h / 2, 3)); g.fill();
  }
}

// ---------- architecture ----------
// Draws a building over sky and still water, with a mirrored reflection.
// kind: 0 cantilevered pavilion, 1 finned monolith, 2 shell roof, 3 stepped terraces
export function architecture(g, x, y, w, h, b, kind, dusk = true, opts = {}) {
  const gy = y + h * (opts.ground ?? 0.7);
  const sk = g.createLinearGradient(0, y, 0, gy);
  if (dusk) {
    sk.addColorStop(0, mix('#0d1d29', b.deep, 0.4));
    sk.addColorStop(0.55, mix('#3d5d73', b.c, 0.25));
    sk.addColorStop(0.86, mix('#d9a77f', b.acc, 0.3));
    sk.addColorStop(1, '#f1cfa9');
  } else {
    sk.addColorStop(0, '#9fb6c2'); sk.addColorStop(1, '#e8ebe6');
  }
  g.fillStyle = sk; g.fillRect(x, y, w, gy - y);
  const wt = g.createLinearGradient(0, gy, 0, y + h);
  if (dusk) { wt.addColorStop(0, '#2c3f4b'); wt.addColorStop(1, '#0a1218'); }
  else { wt.addColorStop(0, '#a9afab'); wt.addColorStop(1, '#6f7673'); }
  g.fillStyle = wt; g.fillRect(x, gy, w, y + h - gy);
  if (!opts.noBuilding) {
    const draw = () => building(g, x, y, w, h, gy, b, kind, dusk);
    g.save(); g.beginPath(); g.rect(x, y, w, gy - y); g.clip(); draw(); g.restore();
    g.save(); g.beginPath(); g.rect(x, gy, w, y + h - gy); g.clip();
    g.translate(0, 2 * gy); g.scale(1, -1); g.globalAlpha = dusk ? 0.34 : 0.2; draw(); g.restore();
  }
  g.fillStyle = dusk ? 'rgba(255,230,200,0.08)' : 'rgba(255,255,255,0.12)';
  for (let k = 1; k < 7; k++) g.fillRect(x, gy + (y + h - gy) * (k / 7) ** 1.4, w, Math.max(1, h * 0.003));
}

function building(g, x, y, w, h, gy, b, kind, dusk) {
  const stone = dusk ? mix(b.cream, '#c9b8a2', 0.35) : mix(b.cream, '#ffffff', 0.4);
  const stoneShade = dusk ? mix(stone, '#1a242b', 0.55) : mix(stone, '#5e666a', 0.45);
  const glass = dusk ? '#16232c' : '#53656e';
  const glow = dusk ? 'rgba(255,214,160,0.92)' : 'rgba(255,255,255,0.25)';
  const X = (f) => x + w * f, Y = (f) => gy - h * f;
  if (kind === 0) {
    // plinth
    g.fillStyle = stoneShade; g.fillRect(X(0.08), Y(0.014), w * 0.86, h * 0.014);
    // glass volume
    g.fillStyle = glass; g.fillRect(X(0.26), Y(0.17), w * 0.5, h * 0.156);
    g.fillStyle = glow; g.fillRect(X(0.3), Y(0.15), w * 0.3, h * 0.12);
    g.fillStyle = dusk ? 'rgba(255,190,130,0.5)' : 'rgba(255,255,255,0.15)'; g.fillRect(X(0.62), Y(0.15), w * 0.1, h * 0.12);
    g.fillStyle = dusk ? 'rgba(20,30,36,0.55)' : 'rgba(40,50,56,0.4)';
    for (let k = 0; k <= 10; k++) g.fillRect(X(0.26 + k * 0.05), Y(0.17), Math.max(1, w * 0.003), h * 0.156);
    // columns and cantilevered roof
    g.fillStyle = stoneShade;
    [0.14, 0.88].forEach((f) => g.fillRect(X(f), Y(0.19), Math.max(1, w * 0.005), h * 0.176));
    g.fillStyle = stone; g.fillRect(X(0.06), Y(0.205), w * 0.9, h * 0.028);
    g.fillStyle = stoneShade; g.fillRect(X(0.06), Y(0.178), w * 0.9, h * 0.006);
  } else if (kind === 1) {
    // finned monolith with a side face for depth
    g.fillStyle = stoneShade;
    g.beginPath(); g.moveTo(X(0.6), Y(0)); g.lineTo(X(0.6), Y(0.56)); g.lineTo(X(0.7), Y(0.6)); g.lineTo(X(0.7), Y(0.03)); g.closePath(); g.fill();
    g.fillStyle = stone; g.fillRect(X(0.34), Y(0.56), w * 0.26, h * 0.56);
    g.fillStyle = dusk ? 'rgba(15,24,30,0.4)' : 'rgba(60,66,70,0.28)';
    for (let k = 0; k < 18; k++) g.fillRect(X(0.345 + k * 0.0142), Y(0.54), Math.max(1, w * 0.0035), h * 0.5);
    g.fillStyle = glow; g.fillRect(X(0.43), Y(0.08), w * 0.08, h * 0.08);
    g.fillStyle = stoneShade; g.fillRect(X(0.12), Y(0.04), w * 0.22, h * 0.04);
  } else if (kind === 2) {
    // shell roof over a glazed hall
    g.fillStyle = glass; g.fillRect(X(0.2), Y(0.2), w * 0.62, h * 0.2);
    g.fillStyle = glow; g.fillRect(X(0.24), Y(0.12), w * 0.5, h * 0.1);
    g.fillStyle = stone;
    g.beginPath();
    g.moveTo(X(0.06), Y(0.02));
    g.quadraticCurveTo(X(0.46), Y(0.62), X(0.92), Y(0.1));
    g.lineTo(X(0.92), Y(0.08));
    g.quadraticCurveTo(X(0.46), Y(0.54), X(0.1), Y(0.0));
    g.closePath(); g.fill();
    g.fillStyle = stoneShade; g.fillRect(X(0.06), Y(0.012), w * 0.88, h * 0.012);
  } else {
    // stepped terraces with planting
    for (let i = 0; i < 5; i++) {
      const x0 = 0.14 + i * 0.06, x1 = 0.86 - i * 0.035, yb = 0.02 + i * 0.085;
      g.fillStyle = glass; g.fillRect(X(x0 + 0.02), Y(yb + 0.07), w * (x1 - x0 - 0.04), h * 0.07);
      g.fillStyle = i % 2 ? glow : (dusk ? 'rgba(255,200,140,0.55)' : 'rgba(255,255,255,0.2)');
      g.fillRect(X(x0 + 0.05), Y(yb + 0.06), w * (x1 - x0) * 0.4, h * 0.05);
      g.fillStyle = stone; g.fillRect(X(x0), Y(yb + 0.085), w * (x1 - x0), h * 0.016);
      g.fillStyle = dusk ? '#3f5a3f' : '#6f8a5f';
      for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(X(x0 + 0.02 + k * (x1 - x0) / 7), Y(yb + 0.095), h * 0.011, 0, Math.PI * 2); g.fill(); }
    }
  }
}

// Isometric massing model on a white plinth.
function isoBox(g, cx, cy, a, bb, hgt, shades) {
  const ax = a * 0.866, ay = a * 0.5, bx = bb * 0.866, by = bb * 0.5;
  g.fillStyle = shades[0];
  g.beginPath(); g.moveTo(cx, cy - hgt); g.lineTo(cx + ax, cy - hgt - ay); g.lineTo(cx + ax - bx, cy - hgt - ay - by); g.lineTo(cx - bx, cy - hgt - by); g.closePath(); g.fill();
  g.fillStyle = shades[1];
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + ax, cy - ay); g.lineTo(cx + ax, cy - ay - hgt); g.lineTo(cx, cy - hgt); g.closePath(); g.fill();
  g.fillStyle = shades[2];
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - bx, cy - by); g.lineTo(cx - bx, cy - by - hgt); g.lineTo(cx, cy - hgt); g.closePath(); g.fill();
}

function planDrawing(g, x, y, w, h, b, r, ink = '#2a3136') {
  g.strokeStyle = ink; g.lineWidth = Math.max(1, w / 140);
  const m = w * 0.1;
  g.strokeRect(x + m, y + m, w - 2 * m, h - 2 * m);
  const cols = 3 + Math.floor(r() * 3);
  for (let k = 1; k < cols; k++) {
    const xx = x + m + ((w - 2 * m) * k) / cols;
    g.beginPath(); g.moveTo(xx, y + m); g.lineTo(xx, y + m + (h - 2 * m) * (0.4 + r() * 0.5)); g.stroke();
  }
  g.beginPath(); g.moveTo(x + m, y + h * 0.55); g.lineTo(x + w * 0.62, y + h * 0.55); g.stroke();
  g.fillStyle = ink;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.fillRect(x + m + (w - 2 * m) * (i + 0.5) / 4 - 1.5, y + m + (h - 2 * m) * (j + 0.5) / 3 - 1.5, 3, 3);
  g.beginPath(); g.arc(x + w * 0.62, y + h * 0.55, w * 0.07, Math.PI, Math.PI * 1.5); g.stroke();
  for (let k = 0; k < 7; k++) g.fillRect(x + w * 0.72, y + h * 0.6 + k * h * 0.032, w * 0.14, Math.max(1, w / 200));
  g.strokeStyle = b.c; g.lineWidth = Math.max(1.5, w / 90);
  g.setLineDash([w / 30, w / 50]);
  g.beginPath(); g.moveTo(x + m * 0.5, y + h * 0.38); g.lineTo(x + w - m * 0.5, y + h * 0.38); g.stroke();
  g.setLineDash([]);
}

// One thumbnail into a rect.
function drawThumb(g, type, b, v, x, y, w, h) {
  const r = rng((v + 1) * 977 + type.length * 31 + b.c.charCodeAt(3));
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  const u = Math.min(w, h) / 100;
  const kind = (BRANDS.indexOf(b) + v) % 4;
  switch (type) {
    case 'poster': {
      architecture(g, x, y, w, h, b, kind, v !== 1);
      g.fillStyle = '#f6efe6';
      g.font = `600 ${10 * u}px ${SANS}`;
      g.fillText(['Space for', 'Light, held', 'The quiet'][v], x + 7 * u, y + 17 * u);
      g.fillText(['the city', 'in stone', 'room'][v], x + 7 * u, y + 28 * u);
      drawMark(g, b.mark, x + 11 * u, y + h - 11 * u, 9 * u, '#f6efe6');
      break;
    }
    case 'social': {
      architecture(g, x, y, w, h, b, (kind + 1) % 4, v === 2, { ground: 0.74 });
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + h * 0.8, w, h * 0.2);
      bars(g, x + 7 * u, y + h - 14 * u, w * 0.5, 2, '#f6efe6', 3.4 * u, 3 * u, r);
      drawMark(g, b.mark, x + w - 11 * u, y + 11 * u, 8 * u, '#f6efe6');
      break;
    }
    case 'slide': {
      g.fillStyle = v === 2 ? b.deep : '#fbfbf7'; g.fillRect(x, y, w, h);
      g.fillStyle = b.c; g.fillRect(x, y, w, 2.6 * u);
      g.fillStyle = v === 2 ? b.cream : '#1d2328';
      g.font = `600 ${8 * u}px ${SANS}`;
      g.fillText(['Competition stage 2', 'Design review', 'Client workshop'][v], x + 6 * u, y + 15 * u);
      bars(g, x + 6 * u, y + 22 * u, w * 0.3, 4, v === 2 ? 'rgba(255,255,255,0.35)' : '#c9ccc4', 2.2 * u, 3 * u, r);
      if (v === 1) architecture(g, x + w * 0.46, y + h * 0.12, w * 0.5, h * 0.78, b, kind, false);
      else planDrawing(g, x + w * 0.46, y + h * 0.1, w * 0.5, h * 0.82, b, r, v === 2 ? '#cfd6d8' : '#2a3136');
      break;
    }
    case 'video': {
      architecture(g, x, y, w, h, b, kind, true);
      g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(x, y, w, h * 0.1); g.fillRect(x, y + h * 0.9, w, h * 0.1);
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.beginPath(); g.moveTo(x + w / 2 - 4 * u, y + h / 2 - 6 * u); g.lineTo(x + w / 2 + 7 * u, y + h / 2); g.lineTo(x + w / 2 - 4 * u, y + h / 2 + 6 * u); g.fill();
      g.font = `500 ${4.6 * u}px ${MONO}`;
      g.fillText(`FLYTHROUGH 00:0${v + 1}:2${v}`, x + 5 * u, y + h - 2 * u);
      break;
    }
    case 'page': {
      g.fillStyle = '#f7f5ef'; g.fillRect(x, y, w, h);
      architecture(g, x, y, w, h * 0.5, b, kind, v === 0);
      g.fillStyle = b.c; g.fillRect(x + 7 * u, y + h * 0.56, 12 * u, 1.6 * u);
      g.fillStyle = '#1d2328'; g.font = `600 ${7.5 * u}px ${SANS}`;
      g.fillText(['Material', 'Light', 'Threshold'][v], x + 7 * u, y + h * 0.56 + 11 * u);
      bars(g, x + 7 * u, y + h * 0.56 + 17 * u, w - 14 * u, 5, '#cfd2ca', 2.2 * u, 3 * u, r);
      break;
    }
    case 'model': {
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, '#e9e8e3'); gr.addColorStop(1, '#cfcdc6');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,0.12)';
      g.beginPath(); g.ellipse(x + w / 2, y + h * 0.8, w * 0.38, h * 0.06, 0, 0, Math.PI * 2); g.fill();
      const sh = ['#fbfaf6', '#d9d6ce', '#bdb9b0'];
      isoBox(g, x + w * 0.5, y + h * 0.82, w * 0.5, w * 0.5, h * 0.05, ['#f4f2ec', '#c9c5bc', '#aeaaa1']);
      const blocks = [[0.42, 0.66, 0.2, 0.18, 0.3], [0.58, 0.7, 0.16, 0.24, 0.16], [0.5, 0.74, 0.3, 0.12, 0.08]];
      blocks.forEach(([fx, fy, a, bb, hh], k) => isoBox(g, x + w * fx, y + h * fy, w * a, w * bb, h * (hh + v * 0.04 * (k === 0)), sh));
      g.fillStyle = b.c; g.fillRect(x + w * 0.08, y + h * 0.08, 2 * u, 10 * u);
      break;
    }
    case 'material': {
      const tiles = [
        [mix(b.cream, '#bfb2a0', 0.4), 'speck'], [mix(b.c, '#7a5a3e', 0.35), 'grain'],
        [mix('#9aa0a2', b.acc, 0.3), 'metal'], [mix(b.cream, '#9d9a92', 0.6), 'speck'],
      ];
      g.fillStyle = '#ece9e2'; g.fillRect(x, y, w, h);
      tiles.forEach(([col, kindT], k) => {
        const tx = x + (k % 2) * w / 2 + 4 * u, ty = y + Math.floor(k / 2) * h / 2 + 4 * u, tw = w / 2 - 8 * u, th = h / 2 - 12 * u;
        g.fillStyle = col; g.fillRect(tx, ty, tw, th);
        if (kindT === 'grain') { g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 9; i++) g.fillRect(tx, ty + (th * i) / 9, tw, Math.max(1, u * 0.6)); }
        if (kindT === 'speck') { g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(tx + r() * tw, ty + r() * th, u * 0.7, u * 0.7); }
        if (kindT === 'metal') { const mg = g.createLinearGradient(tx, ty, tx + tw, ty + th); mg.addColorStop(0, 'rgba(255,255,255,0.35)'); mg.addColorStop(1, 'rgba(0,0,0,0.15)'); g.fillStyle = mg; g.fillRect(tx, ty, tw, th); }
        g.fillStyle = '#5b6266'; g.font = `500 ${3.6 * u}px ${MONO}`;
        g.fillText(['TRAVERTINE', 'OAK', 'BRONZE', 'LIME PLASTER'][k], tx, ty + th + 5 * u);
      });
      break;
    }
    case 'drawing': {
      g.fillStyle = '#f6f4ee'; g.fillRect(x, y, w, h);
      planDrawing(g, x, y, w, h, b, r);
      g.fillStyle = '#5b6266'; g.font = `500 ${3.6 * u}px ${MONO}`;
      g.fillText(['GROUND FLOOR PLAN 1:200', 'SECTION A-A 1:100', 'LEVEL 02 PLAN 1:200'][v], x + 4 * u, y + h - 3 * u);
      break;
    }
    case 'logo': {
      g.fillStyle = [b.cream, b.deep, b.c][v]; g.fillRect(x, y, w, h);
      g.strokeStyle = v === 0 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.25)';
      g.setLineDash([3 * u, 3 * u]); g.lineWidth = Math.max(1, 0.6 * u);
      g.strokeRect(x + w * 0.22, y + h * 0.22, w * 0.56, h * 0.56);
      g.setLineDash([]);
      drawMark(g, b.mark, x + w / 2, y + h / 2, w * 0.32, v === 0 ? b.deep : b.cream);
      break;
    }
    case 'photo': {
      if (v === 0) {
        // facade study: fins with a raking shadow
        g.fillStyle = mix(b.cream, '#d7d0c4', 0.4); g.fillRect(x, y, w, h);
        for (let k = 0; k < 16; k++) {
          const fx = x + (k / 16) * w;
          g.fillStyle = 'rgba(30,34,38,0.28)'; g.fillRect(fx + w * 0.035, y, w * 0.022, h);
          g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(fx, y, w * 0.012, h);
        }
        g.fillStyle = 'rgba(20,26,30,0.35)';
        g.beginPath(); g.moveTo(x, y + h * 0.55); g.lineTo(x + w, y + h * 0.15); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.fill();
      } else if (v === 1) {
        architecture(g, x, y, w, h, b, 1, false, { ground: 0.82 });
      } else {
        // interior: concrete stair and a shaft of light
        g.fillStyle = '#7d7a74'; g.fillRect(x, y, w, h);
        const lg = g.createLinearGradient(x + w * 0.3, y, x + w * 0.7, y + h);
        lg.addColorStop(0, 'rgba(255,240,220,0.75)'); lg.addColorStop(1, 'rgba(255,240,220,0)');
        g.fillStyle = lg;
        g.beginPath(); g.moveTo(x + w * 0.5, y); g.lineTo(x + w * 0.7, y); g.lineTo(x + w * 0.45, y + h); g.lineTo(x + w * 0.15, y + h); g.fill();
        g.fillStyle = '#5f5c57';
        for (let k = 0; k < 9; k++) g.fillRect(x + w * (0.55 + k * 0.04), y + h * (0.9 - k * 0.07), w * 0.45, h * 0.025);
      }
      break;
    }
  }
  g.restore();
}

// Atlas of 6 studios x 10 types x 3 variants on a 16x16 grid of 256px cells.
export function buildAtlas() {
  const CELL = 256, GRID = 16, PAD = 8;
  const c = canvas(CELL * GRID, CELL * GRID);
  const g = c.getContext('2d');
  g.fillStyle = '#10181d'; g.fillRect(0, 0, c.width, c.height);
  const rects = [];
  BRANDS.forEach((b, bi) => {
    TYPES.forEach((t, ti) => {
      for (let v = 0; v < 3; v++) {
        const idx = (bi * TYPES.length + ti) * 3 + v;
        const cx = (idx % GRID) * CELL, cy = Math.floor(idx / GRID) * CELL;
        const a = TYPE_ASPECT[t];
        const inner = CELL - PAD * 2;
        let w = inner, h = inner;
        if (a >= 1) h = inner / a; else w = inner * a;
        const x = cx + (CELL - w) / 2, y = cy + (CELL - h) / 2;
        drawThumb(g, t, b, v, x, y, w, h);
        rects[idx] = [x / c.width, 1 - (y + h) / c.height, (x + w) / c.width, 1 - y / c.height];
      }
    });
  });
  const t = tex(c);
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return { tex: t, rects, canvas: c };
}

export function cellIndex(bi, ti, v) {
  return (bi * TYPES.length + ti) * 3 + v;
}

// The hero launch poster: a cultural pavilion on the water at dusk.
export function drawHeroPoster(w = 1200, h = 1600) {
  const b = BRANDS[2];
  const c = canvas(w, h);
  const g = c.getContext('2d');
  const u = w / 100;
  architecture(g, 0, 0, w, h, b, 0, true, { ground: 0.7 });
  const sg = g.createRadialGradient(w * 0.7, h * 0.66, 0, w * 0.7, h * 0.66, w * 0.45);
  sg.addColorStop(0, 'rgba(255,226,190,0.35)'); sg.addColorStop(1, 'rgba(255,226,190,0)');
  g.fillStyle = sg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6efe6';
  g.font = `600 ${9.4 * u}px ${SANS}`;
  g.letterSpacing = `${-0.3 * u}px`;
  g.fillText('A pavilion for', 7 * u, 17 * u);
  g.fillText('the long light.', 7 * u, 27.5 * u);
  g.letterSpacing = '0px';
  g.font = `500 ${2.3 * u}px ${MONO}`;
  g.fillStyle = 'rgba(246,239,230,0.85)';
  g.fillText('HARBOUR PAVILION  ·  OPENING JUNE 2026', 7.4 * u, 34 * u);
  drawMark(g, b.mark, 11 * u, h - 11 * u, 6 * u, '#f6efe6');
  g.font = `500 ${1.8 * u}px ${MONO}`;
  g.fillText('STUDIO 03 · CULTURAL', 18 * u, h - 10.2 * u);
  return c;
}

export function heroTexture() {
  return tex(drawHeroPoster());
}

// Studio 03 guideline pages.
export const GUIDE_PAGES = [
  { title: 'Logo', no: '02', rule: 'Clear space equals the height of the arch. Minimum width 24 px on screen, 12 mm in print.' },
  { title: 'Colour', no: '03', rule: 'Basalt leads every layout. Copper is an accent and never covers more than 15 per cent of a frame.' },
  { title: 'Typography', no: '04', rule: 'Headlines in Display 600, sentence case, two lines at most. Body copy never below 9 pt.' },
  { title: 'Photography', no: '05', rule: 'Natural light and corrected verticals. People appear for scale only and are never staged.' },
  { title: 'Layout', no: '06', rule: 'The building sits on the lower third. Copy aligns to the left margin of the 12-column grid.' },
  { title: 'Tone of voice', no: '07', rule: 'Precise and calm. We describe space, light and material, and we avoid superlatives.' },
];

export function drawGuidePage(p, i) {
  const b = BRANDS[2];
  const w = 900, h = 1240;
  const c = canvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = '#f7f5ef'; g.fillRect(0, 0, w, h);
  g.fillStyle = b.c; g.fillRect(0, 0, w, 14);
  g.fillStyle = '#0f2a38';
  g.font = `500 20px ${MONO}`;
  g.fillText(`STUDIO 03 · GUIDELINES · ${p.no}`, 60, 80);
  g.font = `600 76px ${SANS}`;
  g.fillText(p.title, 56, 190);
  g.fillStyle = '#4a5a62';
  g.font = `400 27px ${SANS}`;
  const words = p.rule.split(' ');
  let line = '', y = 260;
  for (const wd of words) {
    if (g.measureText(line + wd).width > w - 130) { g.fillText(line, 60, y); line = ''; y += 40; }
    line += wd + ' ';
  }
  g.fillText(line, 60, y);
  const top = 470;
  if (i === 0) {
    g.fillStyle = '#eceae2'; g.fillRect(60, top, w - 120, 520);
    g.strokeStyle = b.c; g.setLineDash([10, 10]); g.lineWidth = 3;
    g.strokeRect(w / 2 - 190, top + 70, 380, 380); g.setLineDash([]);
    drawMark(g, b.mark, w / 2, top + 260, 200, '#0f2a38');
  } else if (i === 1) {
    ['#22303a', b.c, b.acc, '#eef1f0', '#c9c2b6'].forEach((col, k) => {
      g.fillStyle = col; g.fillRect(60 + k * 158, top, 140, 380);
      g.fillStyle = '#4a5a62'; g.font = `500 19px ${MONO}`;
      g.fillText(['BASALT', 'FJORD', 'COPPER', 'SALT', 'STONE'][k], 60 + k * 158, top + 420);
    });
  } else if (i === 2) {
    g.fillStyle = '#0f2a38'; g.font = `600 240px ${SANS}`; g.fillText('Aa', 56, top + 230);
    g.font = `500 22px ${MONO}`; g.fillStyle = b.c;
    ['DISPLAY 600 · 72/76', 'HEADLINE 600 · 40/44', 'BODY 400 · 16/24'].forEach((s, k) => g.fillText(s, 60, top + 330 + k * 46));
  } else if (i === 3) {
    architecture(g, 60, top, w - 120, 520, b, 1, false, { ground: 0.82 });
  } else if (i === 4) {
    g.fillStyle = '#e4e7e5'; g.fillRect(60, top, w - 120, 520);
    architecture(g, 60, top + 300, w - 120, 220, b, 0, false, { ground: 0.75 });
    g.strokeStyle = 'rgba(95,156,188,0.55)'; g.lineWidth = 2;
    for (let k = 0; k <= 12; k++) { g.beginPath(); g.moveTo(60 + k * 65, top); g.lineTo(60 + k * 65, top + 520); g.stroke(); }
    g.fillStyle = '#0f2a38'; g.fillRect(60, top + 40, 380, 34); g.fillRect(60, top + 86, 300, 34);
  } else {
    g.fillStyle = '#0f2a38'; g.font = `600 52px ${SANS}`;
    g.fillText('“A pavilion for', 60, top + 90); g.fillText('the long light.”', 60, top + 160);
    g.font = `500 22px ${MONO}`; g.fillStyle = '#2f7f62'; g.fillText('✓  SPACE, LIGHT, MATERIAL', 60, top + 260);
    g.fillStyle = '#b4553c'; g.fillText('✕  “The most iconic building ever”', 60, top + 310);
  }
  g.fillStyle = '#8fa0a6'; g.font = `500 18px ${MONO}`;
  g.fillText(`${p.no} / 48`, w - 140, h - 50);
  return tex(c);
}

// Top label for a skill module.
export function skillLabelTexture(skill, brand, version) {
  const w = 512, h = 352;
  const c = canvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = '#151d22'; g.fillRect(0, 0, w, h);
  g.fillStyle = brand.c; g.fillRect(0, 0, 10, h);
  g.fillStyle = '#8fa6b0'; g.font = `500 26px ${MONO}`;
  g.fillText('SKILL', 44, 62);
  g.fillText(version, w - 44 - g.measureText(version).width, 62);
  g.fillStyle = '#fbfbf7'; g.font = `600 64px ${SANS}`;
  g.fillText(skill.name, 42, 170);
  g.fillStyle = '#8fdcd2'; g.font = `500 24px ${MONO}`;
  g.fillText(`${brand.id} · ${skill.key.toUpperCase()}`, 44, 230);
  g.strokeStyle = '#26363f'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(44, 268); g.lineTo(w - 44, 268); g.stroke();
  g.fillStyle = '#5d717a'; g.font = `500 21px ${MONO}`;
  g.fillText('RULES ' + (12 + skill.name.length * 3) + '  ·  CHECKS ' + (4 + skill.name.length), 44, 310);
  return tex(c);
}

// Layers of the generated launch visual. The building itself is a 3D model in the scene.
export function creativeLayers() {
  const b = BRANDS[2];
  const W = 720, H = 1280;
  const mk = (draw) => { const c = canvas(W, H); draw(c.getContext('2d')); return tex(c); };
  const bg = mk((g) => {
    architecture(g, 0, 0, W, H, b, 0, true, { ground: 0.7, noBuilding: true });
    const sg = g.createRadialGradient(W * 0.62, H * 0.68, 0, W * 0.62, H * 0.68, W * 0.6);
    sg.addColorStop(0, 'rgba(255,226,190,0.45)'); sg.addColorStop(1, 'rgba(255,226,190,0)');
    g.fillStyle = sg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1a2a33';
    g.beginPath(); g.moveTo(0, H * 0.7); g.bezierCurveTo(W * 0.12, H * 0.675, W * 0.22, H * 0.68, W * 0.3, H * 0.7); g.fill();
  });
  const headline = mk((g) => {
    g.fillStyle = '#f6efe6';
    g.font = `600 74px ${SANS}`;
    g.letterSpacing = '-2px';
    g.fillText('A pavilion for', 56, 330);
    g.fillText('the long light.', 56, 412);
    g.letterSpacing = '0px';
    g.font = `500 21px ${MONO}`;
    g.fillStyle = 'rgba(246,239,230,0.85)';
    g.fillText('HARBOUR PAVILION · JUNE 2026', 60, 466);
  });
  const logo = mk((g) => {
    drawMark(g, b.mark, 92, 168, 64, '#f6efe6');
    g.font = `500 20px ${MONO}`; g.fillStyle = '#f6efe6';
    g.fillText('STUDIO 03', 140, 176);
  });
  const cta = mk((g) => {
    rr(g, 56, H - 330, 236, 72, 36); g.fillStyle = '#f6efe6'; g.fill();
    g.fillStyle = '#0f2a38'; g.font = `600 27px ${SANS}`; g.fillText('Book a visit', 92, H - 284);
  });
  const disclaimer = mk((g) => {
    g.fillStyle = 'rgba(246,239,230,0.85)'; g.font = `500 17px ${MONO}`;
    g.fillText('VISUALISATION SUBJECT TO PLANNING CONSENT', 60, H - 214);
  });
  const safe = mk((g) => {
    g.strokeStyle = 'rgba(143,220,210,0.95)'; g.setLineDash([14, 10]); g.lineWidth = 3;
    g.strokeRect(36, 250 * (H / 1920), W - 72, H - (250 + 340) * (H / 1920));
    g.setLineDash([]);
    g.fillStyle = 'rgba(143,220,210,0.95)'; g.font = `500 18px ${MONO}`;
    g.fillText('SAFE ZONE · STORY 1080×1920', 50, H - 340 * (H / 1920) - 16);
  });
  return { bg, headline, logo, cta, disclaimer, safe, aspect: W / H };
}

// Small rounded label used for floating 3D rule frames.
export function ruleTexture(text) {
  const c = canvas(512, 64);
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(12,27,36,0.9)';
  rr(g, 0, 8, 512, 48, 10); g.fill();
  g.fillStyle = '#8fdcd2'; g.font = `500 24px ${MONO}`;
  g.fillText(text.toUpperCase(), 18, 41);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
