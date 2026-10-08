import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { BRANDS, REGIONS, TYPES, SKILLS, AGENTS, HERO_BRAND, rng } from './data.js';
import {
  buildAtlas, cellIndex, TYPE_ASPECT, drawHeroPoster, heroTexture, GUIDE_PAGES, drawGuidePage,
  skillLabelTexture, creativeLayers, ruleTexture,
} from './textures.js';

const BG = new THREE.Color('#0a1013');
const TEAL_SOFT = new THREE.Color('#8fdcd2');
const MINT = new THREE.Color('#16ffc6');
const WARM = new THREE.Color('#f4efe6');
const FOG_DENSITY = 0.0085;

const ease = {
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  lin: (t) => t,
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- world constants (also used by slides) ----------
export const N_ASSETS = 2400;
export const HUB_R = 24;
export const HUB_Y = 8;
export const CHAMBER_R = 52;
export const brandAngle = (b) => ((b - HERO_BRAND) * Math.PI) / 3;
export const hubPos = (b) => v3(Math.sin(brandAngle(b)) * HUB_R, HUB_Y, Math.cos(brandAngle(b)) * HUB_R);
export const chamberPos = (b) => v3(Math.sin(brandAngle(b)) * CHAMBER_R, HUB_Y, Math.cos(brandAngle(b)) * CHAMBER_R);
export const C = chamberPos(HERO_BRAND);
export const HERO_POS = v3(0, 4, 30);

function campaignPos(b, c) {
  const a = brandAngle(b) + [-0.24, 0.24, 0][c];
  const r = 32 + (c === 2 ? 1 : 0);
  return v3(Math.sin(a) * r, HUB_Y + [3.8, 3.8, -3.6][c], Math.cos(a) * r);
}
function regionPos(r) {
  const a = (r / REGIONS.length) * Math.PI * 2 + 0.18;
  return v3(Math.sin(a) * 13, -2, Math.cos(a) * 13);
}

const DEFAULTS = {
  layout: 0, chaosRate: 1, scanX: -90, scanOn: 0, recog: 0, brackets: 0, dim: 0, focus: 0,
  graph: 0, path: 0, hero: 0, grid: 0.5, dof: 60,
  book: 0, stage: 0, skills: 0, ring: 0, core: 0, agents: 0, mini: 0, travelers: 0,
  creative: 0, build: 0, explode: 0, govern: 0, fix: 0, safe: 0, cgrid: 0, loop: 0, links: 0, flow: 0,
};

class Params {
  constructor(defs) {
    this.p = {};
    for (const k in defs) this.p[k] = { v: defs[k], from: defs[k], to: defs[k], t0: 0, dur: 0, e: ease.io };
  }
  get(k) { return this.p[k].v; }
  set(k, to, dur, delay, now, e = ease.io, from) {
    const q = this.p[k];
    if (from !== undefined) q.v = from;
    if (q.to === to && from === undefined && q.dur > 0) return;
    q.from = q.v; q.to = to; q.t0 = now + delay * 1000; q.dur = Math.max(1, dur * 1000); q.e = e;
  }
  update(now) {
    for (const k in this.p) {
      const q = this.p[k];
      if (q.v === q.to) continue;
      const t = clamp01((now - q.t0) / q.dur);
      q.v = q.from + (q.to - q.from) * q.e(t);
      if (t >= 1) q.v = q.to;
    }
  }
}

// ---------- shaders ----------
const CARD_VS = /* glsl */ `
uniform float uLayout; uniform float uChaosT; uniform float uScanX; uniform float uScanOn;
uniform float uRecog; uniform float uFocus; uniform float uDim; uniform float uHero;
uniform float uFocusDist; uniform float uFocusRange; uniform float uFog;
uniform vec3 uBrandCols[6];
attribute vec4 aInfo; attribute vec4 aUv;
attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3;
attribute vec3 aR0; attribute vec3 aR1; attribute vec3 aR2; attribute vec3 aR3;
attribute vec4 aS; attribute vec4 aClu; attribute vec4 aDrift;
varying vec2 vUv; varying vec2 vAtlas; varying vec3 vBrand; varying float vRec; varying float vScan;
varying float vBlur; varying float vFog; varying float vNdl; varying float vDimF;
mat3 rotM(vec3 r){
  float cx=cos(r.x), sx=sin(r.x), cy=cos(r.y), sy=sin(r.y), cz=cos(r.z), sz=sin(r.z);
  mat3 Rx = mat3(1.,0.,0., 0.,cx,sx, 0.,-sx,cx);
  mat3 Ry = mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy);
  mat3 Rz = mat3(cz,sz,0., -sz,cz,0., 0.,0.,1.);
  return Ry*Rx*Rz;
}
vec3 chaos(out vec3 rot){
  rot = aR0;
  if (aDrift.w > 1.5) return aP0;
  float ang = aClu.w * uChaosT;
  vec3 d = aP0 - aClu.xyz;
  float c = cos(ang), s = sin(ang);
  d = vec3(c*d.x + s*d.z, d.y, -s*d.x + c*d.z);
  rot.y += ang;
  float t = uChaosT*aDrift.y + aDrift.z;
  vec3 drift = aDrift.x * vec3(sin(t), sin(t*1.3+2.1), cos(t*0.9+4.2));
  rot += aDrift.x*0.5*vec3(sin(t*0.7), cos(t*0.5), sin(t*0.9));
  return aClu.xyz + d + drift;
}
void main(){
  float L = clamp(uLayout, 0., 3.);
  float k = min(floor(L), 2.);
  float f = L - k;
  float seed = aInfo.w;
  float st = clamp((f - seed*0.4)/0.6, 0., 1.);
  st = st*st*(3.-2.*st);
  vec3 pA; vec3 pB; vec3 rA; vec3 rB; float sA; float sB;
  if (k < 0.5) { pA = chaos(rA); pB = aP1; rB = aR1; sA = aS.x; sB = aS.y; }
  else if (k < 1.5) { pA = aP1; rA = aR1; pB = aP2; rB = aR2; sA = aS.y; sB = aS.z; }
  else { pA = aP2; rA = aR2; pB = aP3; rB = aR3; sA = aS.z; sB = aS.w; }
  float arc = sin(st*3.14159);
  vec3 P = mix(pA, pB, st);
  P.y += arc * (1.0 + seed*4.0) * (k < 1.5 ? 1.0 : 0.25);
  vec3 R = mix(rA, rB, st);
  float S = mix(sA, sB, st);
  if (aDrift.w > 1.5 && uHero > 0.999) S = 0.;
  mat3 M = rotM(R);
  vec3 wp = P + M * vec3(position.xy * aInfo.xy * S, 0.);
  vec3 n = M * vec3(0.,0.,1.);
  vec4 mv = viewMatrix * vec4(wp, 1.);
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vAtlas = mix(aUv.xy, aUv.zw, uv);
  vBrand = uBrandCols[int(aInfo.z + 0.5)];
  vRec = uRecog * (1. - smoothstep(uScanX - 1., uScanX + 1., P.x));
  vScan = uScanOn * exp(-abs(P.x - uScanX) * 0.45);
  float depth = -mv.z;
  vBlur = clamp(abs(depth - uFocusDist) / uFocusRange, 0., 1.);
  vFog = 1. - exp(-uFog*uFog*depth*depth);
  vNdl = dot(n, normalize(vec3(0.35, 0.8, 0.55)));
  vDimF = max(uDim, uFocus * step(0.5, abs(aInfo.z - 2.0)));
}`;

const CARD_FS = /* glsl */ `
uniform sampler2D uMap; uniform vec3 uFogCol; uniform vec3 uTeal; uniform float uBrackets;
varying vec2 vUv; varying vec2 vAtlas; varying vec3 vBrand; varying float vRec; varying float vScan;
varying float vBlur; varying float vFog; varying float vNdl; varying float vDimF;
void main(){
  vec3 col = texture2D(uMap, vAtlas, vBlur * 3.2).rgb;
  float ndl = gl_FrontFacing ? vNdl : -vNdl;
  if (!gl_FrontFacing) col = vec3(0.06, 0.075, 0.085) + vBrand * 0.06;
  vec2 fw = max(fwidth(vUv), vec2(1e-5));
  vec2 dpx = min(vUv, 1. - vUv) / fw;
  float e = min(dpx.x, dpx.y);
  float edge = 1. - smoothstep(0.6, 1.8, e);
  col = mix(col, vBrand * 1.15, edge * vRec);
  vec2 c = min(vUv, 1. - vUv);
  float corner = step(max(c.x, c.y), 0.18);
  float br = (1. - smoothstep(1.8, 3.2, e)) * corner * uBrackets * vRec;
  col = mix(col, uTeal, br);
  col += uTeal * vScan * 0.3;
  col *= 0.74 + 0.3 * max(ndl, 0.);
  col *= mix(1., 0.16, vDimF);
  col = mix(col, uFogCol, vFog);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;

const NODE_VS = /* glsl */ `
attribute float aSize; attribute vec3 aCol; attribute float aDelay; attribute float aBrand; attribute float aKind;
uniform float uReveal; uniform float uFocus; uniform float uScale; uniform float uFog;
varying vec3 vCol; varying float vA; varying float vKind; varying float vFogF;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * mv;
  float r = clamp((uReveal - aDelay*0.6) / 0.4, 0., 1.);
  float dimF = uFocus * step(0.5, abs(aBrand - 2.0)) * step(-0.5, aBrand);
  vA = r * mix(1., 0.22, dimF);
  vCol = aCol; vKind = aKind;
  gl_PointSize = aSize * uScale / -mv.z * (0.6 + 0.4*r);
  float d = -mv.z;
  vFogF = 1. - exp(-uFog*uFog*d*d);
}`;
const NODE_FS = /* glsl */ `
uniform vec3 uFogCol;
varying vec3 vCol; varying float vA; varying float vKind; varying float vFogF;
void main(){
  vec2 p = gl_PointCoord * 2. - 1.;
  float d = length(p);
  float aa = fwidth(d);
  float dot_ = 1. - smoothstep(0.34 - aa, 0.34 + aa, d);
  float ring = (1. - smoothstep(0.06 - aa, 0.06 + aa, abs(d - 0.8))) * vKind;
  float halo = exp(-d * d * 5.) * 0.18;
  float a = max(max(dot_, ring * 0.8), halo) * vA;
  if (a < 0.01) discard;
  vec3 col = mix(vCol, uFogCol, vFogF);
  gl_FragColor = vec4(col, a * (1. - vFogF * 0.7));
  #include <colorspace_fragment>
}`;

const EDGE_VS = /* glsl */ `
attribute vec3 aPos3; attribute vec3 aCol; attribute vec2 aEdge; attribute float aBrand;
uniform float uEco; uniform float uReveal; uniform float uTime; uniform float uFocus; uniform float uFog;
varying vec3 vCol; varying float vA; varying float vT; varying float vSeed; varying float vFogF;
void main(){
  vec3 p = mix(position, aPos3, uEco);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  vT = aEdge.x; vSeed = aEdge.y;
  float r = clamp((uReveal - aEdge.y*0.5) / 0.5, 0., 1.);
  float dimF = uFocus * step(0.5, abs(aBrand - 2.0)) * step(-0.5, aBrand);
  vA = r * mix(1., 0.15, dimF);
  vCol = aCol;
  float d = -mv.z;
  vFogF = 1. - exp(-uFog*uFog*d*d);
}`;
const EDGE_FS = /* glsl */ `
uniform float uTime; uniform float uAlpha;
varying vec3 vCol; varying float vA; varying float vT; varying float vSeed; varying float vFogF;
void main(){
  float ph = fract(uTime * (0.18 + vSeed * 0.25) + vSeed * 7.0);
  float pulse = exp(-pow((vT - ph) * 9., 2.));
  float a = (uAlpha + pulse * 0.55) * vA * (1. - vFogF);
  gl_FragColor = vec4(vCol * (1. + pulse * 0.8), a);
  #include <colorspace_fragment>
}`;

const GRID_VS = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const GRID_FS = /* glsl */ `
uniform float uAlpha; uniform vec3 uCol; uniform vec3 uCam;
varying vec3 vW;
float gridLine(vec2 p, float s){ vec2 g = p / s; vec2 a = abs(fract(g - 0.5) - 0.5) / fwidth(g); return 1. - min(min(a.x, a.y), 1.); }
void main(){
  float l1 = gridLine(vW.xz, 2.0);
  float l2 = gridLine(vW.xz, 10.0);
  float d = length(vW.xz);
  float fade = 1. - smoothstep(30., 150., d);
  float camd = length(vW - uCam);
  float a = (l1 * 0.28 + l2 * 0.55) * fade * uAlpha * exp(-camd * 0.006);
  gl_FragColor = vec4(uCol, a);
  #include <colorspace_fragment>
}`;

// ---------- helpers ----------
function wrapAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }

function fatLine(points, color, width, opacity = 1) {
  const g = new LineGeometry();
  g.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false, worldUnits: false });
  const l = new Line2(g, m);
  l.computeLineDistances();
  l.frustumCulled = false;
  return l;
}

// ===================================================================
export class World {
  constructor(canvas) {
    this.canvas = canvas;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { this.failed = true; return; }
    if (!renderer.getContext()) { this.failed = true; return; }
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(BG, 1);

    this.scene = new THREE.Scene();
    this.scene.background = BG;
    this.scene.fog = new THREE.FogExp2(BG, FOG_DENSITY);
    const pm = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;

    this.camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 900);
    this.params = new Params(DEFAULTS);
    this.time = 0; this.chaosT = 0; this.now = performance.now();
    this.cam = { pos: v3(0, 4, 32), tgt: v3(0, 4, 30), fov: 36, shift: 0 };
    this.camTween = null;
    this.orbit = { angle: 0, speed: 0, drift: 0.25 };
    this.anchors = {};
    this.litSkills = new Set();
    this.litLevel = new Array(9).fill(0);

    const key = new THREE.DirectionalLight(0xfff1e2, 1.6); key.position.set(30, 60, 50);
    const rim = new THREE.DirectionalLight(0x9fd8e8, 0.7); rim.position.set(-40, 20, -40);
    this.scene.add(key, rim, new THREE.AmbientLight(0x30404a, 0.6));

    this.buildGrid();
    this.buildDust();
    this.buildAssets();
    this.buildHero();
    this.buildScan();
    this.buildGraph();
    this.buildChamber();
    this.buildMiniChambers();
    this.buildAgents();
    this.buildCreative();
    this.buildGovernance();
    this.buildLoop();
    this.buildFlow();
  }

  // ---------------- grid floor + dust ----------------
  buildGrid() {
    const m = new THREE.ShaderMaterial({
      vertexShader: GRID_VS, fragmentShader: GRID_FS, transparent: true, depthWrite: false,
      uniforms: { uAlpha: { value: 0.5 }, uCol: { value: new THREE.Color('#3b5966') }, uCam: { value: v3(0, 0, 0) } },
    });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), m);
    g.rotation.x = -Math.PI / 2; g.position.y = -9;
    this.grid = g; this.scene.add(g);
  }

  buildDust() {
    const n = 1600, r = rng(41);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * 220; pos[i * 3 + 1] = -8 + r() * 60; pos[i * 3 + 2] = (r() - 0.5) * 220; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: 0xcfd8d6, size: 0.09, transparent: true, opacity: 0.32, depthWrite: false, sizeAttenuation: true });
    this.dust = new THREE.Points(g, m); this.scene.add(this.dust);
  }

  // ---------------- assets ----------------
  buildAssets() {
    const atlas = buildAtlas();
    // hero poster into the last cell
    const hc = drawHeroPoster(240, 320);
    const ag = atlas.canvas.getContext('2d');
    const cx = 15 * 256 + (256 - 180) / 2, cy = 15 * 256 + 8;
    ag.drawImage(hc, cx, cy, 180, 240);
    atlas.rects[255] = [cx / 4096, 1 - (cy + 240) / 4096, (cx + 180) / 4096, 1 - cy / 4096];
    atlas.tex.needsUpdate = true;
    this.atlas = atlas;

    const N = N_ASSETS, r = rng(11);
    const info = new Float32Array(N * 4), uvs = new Float32Array(N * 4);
    const P = [0, 1, 2, 3].map(() => new Float32Array(N * 3));
    const R = [0, 1, 2, 3].map(() => new Float32Array(N * 3));
    const S = new Float32Array(N * 4), clu = new Float32Array(N * 4), drift = new Float32Array(N * 4);

    // asset metadata
    const assets = [];
    for (let i = 0; i < N; i++) {
      let b = Math.floor(r() * 6);
      let t = Math.floor(r() * TYPES.length);
      let v = Math.floor(r() * 3);
      let c = r() < 0.45 ? 2 : (r() < 0.5 ? 0 : 1);
      let reg = Math.floor(r() * REGIONS.length);
      if (i === 0) { b = HERO_BRAND; t = 0; v = 0; c = 0; reg = 0; }
      assets.push({ i, b, t, v, c, reg, seed: r() });
    }
    this.assets = assets;

    // ---- layout 0: chaos clusters ----
    const CL = [
      { c: v3(-40, 6, -14), spin: 0.05 }, { c: v3(30, 5, -32), spin: 0.16 }, { c: v3(46, 11, 4), spin: 0.11 },
      { c: v3(-48, -5, 14), spin: -0.04 }, { c: v3(-14, 17, -46), spin: 0.09 }, { c: v3(19, 1, 8), spin: 0.32 },
      { c: v3(-22, -4, -10), spin: 0.03 }, { c: v3(4, 24, -22), spin: -0.14 },
    ];
    this.clusters = CL;
    const sizes = [300, 240, 220, 200, 150, 200, 160, 280];
    const order = assets.slice(1).sort(() => r() - 0.5);
    let ptr = 0;
    const members = CL.map((_, k) => order.slice(ptr, (ptr += sizes[k])));
    const strays = order.slice(ptr);

    const setP = (arr, i, p) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; };
    const setR = (arr, i, x, y, z) => { arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z; };
    const rotY = (p, a) => v3(Math.cos(a) * p.x + Math.sin(a) * p.z, p.y, -Math.sin(a) * p.x + Math.cos(a) * p.z);

    members.forEach((list, k) => {
      const ctr = CL[k].c;
      list.forEach((a, j) => {
        let p, rx = 0, ry = 0, rz = 0;
        if (k === 0) { const cols = 24; p = v3((j % cols - cols / 2) * 1.3, Math.floor(j / cols) * 1.55 - 9, 0); p = rotY(p, 0.7); ry = 0.7; }
        else if (k === 1) { const per = 46, ang = (j % per) / per * Math.PI * 2, tier = Math.floor(j / per); p = v3(Math.cos(ang) * 8.5, tier * 1.6 - 4, Math.sin(ang) * 8.5); ry = Math.PI / 2 - ang; }
        else if (k === 2) { p = v3((r() - 0.5) * 13, (r() - 0.5) * 9, (r() - 0.5) * 9); rx = r() * 6; ry = r() * 6; rz = r() * 6; }
        else if (k === 3) { const st = j % 8, h = Math.floor(j / 8); p = v3((st % 4 - 1.5) * 3.2, h * 0.12 - 3, (Math.floor(st / 4) - 0.5) * 3.6); rx = -Math.PI / 2; rz = (r() - 0.5) * 0.5; }
        else if (k === 4) { const fan = j % 6, q = Math.floor(j / 6); const piv = v3((fan % 3 - 1) * 7, Math.floor(fan / 3) * 6 - 3, 0); const ang = (q / 25 - 0.5) * 1.8; p = piv.clone().add(v3(Math.sin(ang) * 1.4, Math.cos(ang) * 1.4, q * 0.02)); rz = -ang; }
        else if (k === 5) { const ang = j * 0.3; p = v3(Math.cos(ang) * 5, j * 0.085 - 8, Math.sin(ang) * 5); ry = Math.PI / 2 - ang; }
        else if (k === 6) { const tw = j % 5, h = Math.floor(j / 5); p = v3((tw - 2) * 2.6, h * 0.16 - 4, (tw % 2) * 1.5); rx = -Math.PI / 2; rz = (r() - 0.5) * 0.3; }
        else { const n = list.length, y = 1 - (j / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = j * 2.39996; p = v3(Math.cos(th) * rad * 7, y * 7, Math.sin(th) * rad * 7); ry = Math.atan2(p.x, p.z); rx = -Math.asin(y) ; }
        setP(P[0], a.i, p.add(ctr)); setR(R[0], a.i, rx, ry, rz);
        clu[a.i * 4] = ctr.x; clu[a.i * 4 + 1] = ctr.y; clu[a.i * 4 + 2] = ctr.z; clu[a.i * 4 + 3] = CL[k].spin;
        drift[a.i * 4] = 0.12 + r() * 0.15; drift[a.i * 4 + 1] = 0.4 + r() * 0.5; drift[a.i * 4 + 2] = r() * 6.28; drift[a.i * 4 + 3] = 0;
        a.cluster = k;
      });
    });
    strays.forEach((a, j) => {
      let p;
      if (j < 190) {
        do { p = v3((r() - 0.5) * 30, -4 + r() * 16, 12 + r() * 22); }
        while (p.distanceTo(HERO_POS) < 2.4 || (p.z > 26 && Math.abs(p.x) < 4 && Math.abs(p.y - 4) < 4));
      } else p = v3((r() - 0.5) * 120, -6 + r() * 36, (r() - 0.5) * 110);
      setP(P[0], a.i, p); setR(R[0], a.i, (r() - 0.5) * 1.2, (r() - 0.5) * 2, (r() - 0.5) * 0.8);
      clu[a.i * 4] = p.x; clu[a.i * 4 + 1] = p.y; clu[a.i * 4 + 2] = p.z; clu[a.i * 4 + 3] = 0;
      drift[a.i * 4] = 0.5 + r() * 1.1; drift[a.i * 4 + 1] = 0.35 + r() * 1.2; drift[a.i * 4 + 2] = r() * 6.28; drift[a.i * 4 + 3] = 1;
      a.cluster = -1;
    });
    // hero: pinned, facing camera
    setP(P[0], 0, HERO_POS); setR(R[0], 0, 0, 0, 0);
    clu.set([HERO_POS.x, HERO_POS.y, HERO_POS.z, 0], 0); drift.set([0, 0, 0, 2], 0);

    // ---- layout 1: library amphitheatre ----
    const sorted = assets.slice().sort((a, b) => a.b - b.b || a.c - b.c || a.t - b.t || a.i - b.i);
    const ROWS = 14, LIB_R = 46, SPAN = 3.7;
    const totalCols = Math.ceil(N / ROWS) + 5 * 3;
    const da = SPAN / totalCols;
    let col = 0, row = 0, lastB = sorted[0].b;
    this.libSections = BRANDS.map(() => ({ c0: Infinity, c1: -Infinity }));
    for (const a of sorted) {
      if (a.b !== lastB) { if (row > 0) { col++; row = 0; } col += 3; lastB = a.b; }
      const ang = -SPAN / 2 + col * da;
      setP(P[1], a.i, v3(Math.sin(ang) * LIB_R, -3.4 + row * 1.02, -Math.cos(ang) * LIB_R));
      setR(R[1], a.i, 0, -ang, 0);
      const s = this.libSections[a.b]; s.c0 = Math.min(s.c0, ang); s.c1 = Math.max(s.c1, ang);
      row++; if (row >= ROWS) { row = 0; col++; }
    }
    this.libSections.forEach((s) => {
      const ang = (s.c0 + s.c1) / 2;
      s.top = v3(Math.sin(ang) * LIB_R, -3.4 + ROWS * 1.02 + 0.6, -Math.cos(ang) * LIB_R);
    });

    // ---- layouts 2 & 3: semantic graph and organised ecosystem ----
    const byCamp = {};
    for (const a of assets) { const key = a.b * 3 + a.c; (byCamp[key] ||= []).push(a); }
    for (const key in byCamp) {
      const list = byCamp[key];
      const b = Math.floor(key / 3), c = key % 3;
      const K = campaignPos(b, c);
      const outward = v3(K.x, 0, K.z).normalize();
      list.forEach((a, j) => {
        // shell
        const y = 1 - ((j + 0.5) / list.length) * 2, rad = Math.sqrt(1 - y * y), th = j * 2.39996;
        const dir = v3(Math.cos(th) * rad, y, Math.sin(th) * rad);
        const dist = 1.5 + a.seed * 2.2;
        let p = K.clone().addScaledVector(dir, dist);
        let ry = Math.atan2(dir.x, dir.z), rx = -Math.asin(y) * 0.8;
        if (a.i === 0) { p = K.clone().addScaledVector(outward, 3.9).add(v3(0, 0.6, 0)); ry = Math.atan2(outward.x, outward.z); rx = 0; }
        setP(P[2], a.i, p); setR(R[2], a.i, rx, ry, 0);
        // organised rings, lying flat
        let ringI = 0, cap = 0, start = 0;
        while (true) { const rr = 1.7 + ringI * 0.62; cap = Math.floor((rr * Math.PI * 2) / 0.62); if (j < start + cap) break; start += cap; ringI++; }
        const rr = 1.7 + ringI * 0.62, ang = ((j - start) / cap) * Math.PI * 2 + ringI * 0.3;
        setP(P[3], a.i, K.clone().add(v3(Math.cos(ang) * rr, (c === 2 ? -0.4 : 0.4) * 0, Math.sin(ang) * rr)));
        setR(R[3], a.i, -Math.PI / 2, 0, -ang + Math.PI / 2);
        a.K = K;
      });
    }

    for (const a of assets) {
      const t = TYPES[a.t], asp = TYPE_ASPECT[t];
      const w = asp >= 1 ? 1 : asp, h = asp >= 1 ? 1 / asp : 1;
      info.set([w, h, a.b, a.seed], a.i * 4);
      const rect = atlas.rects[a.i === 0 ? 255 : cellIndex(a.b, a.t, a.v)];
      uvs.set(rect, a.i * 4);
      S.set([1.15, 0.86, 0.34, 0.42], a.i * 4);
      // shortest rotation paths between layouts
      for (let L = 1; L < 4; L++) for (let ax = 0; ax < 3; ax++) {
        const prev = R[L - 1][a.i * 3 + ax];
        R[L][a.i * 3 + ax] = prev + wrapAngle(R[L][a.i * 3 + ax] - prev);
      }
    }
    S.set([1.15, 0.86, 0.5, 0.5], 0);

    const base = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute('position', base.getAttribute('position'));
    g.setAttribute('uv', base.getAttribute('uv'));
    const ia = (arr, n) => new THREE.InstancedBufferAttribute(arr, n);
    g.setAttribute('aInfo', ia(info, 4)); g.setAttribute('aUv', ia(uvs, 4));
    P.forEach((arr, k) => g.setAttribute('aP' + k, ia(arr, 3)));
    R.forEach((arr, k) => g.setAttribute('aR' + k, ia(arr, 3)));
    g.setAttribute('aS', ia(S, 4)); g.setAttribute('aClu', ia(clu, 4)); g.setAttribute('aDrift', ia(drift, 4));
    g.instanceCount = N;

    this.cardU = {
      uMap: { value: atlas.tex }, uLayout: { value: 0 }, uChaosT: { value: 0 }, uScanX: { value: -90 }, uScanOn: { value: 0 },
      uRecog: { value: 0 }, uFocus: { value: 0 }, uDim: { value: 0 }, uHero: { value: 0 }, uBrackets: { value: 0 },
      uFocusDist: { value: 30 }, uFocusRange: { value: 60 }, uFog: { value: FOG_DENSITY },
      uFogCol: { value: BG }, uTeal: { value: TEAL_SOFT },
      uBrandCols: { value: BRANDS.map((b) => new THREE.Color(b.c)) },
    };
    const m = new THREE.ShaderMaterial({ vertexShader: CARD_VS, fragmentShader: CARD_FS, uniforms: this.cardU, side: THREE.DoubleSide });
    m.extensions = { derivatives: true };
    this.cards = new THREE.Mesh(g, m);
    this.cards.frustumCulled = false;
    this.scene.add(this.cards);
    this.P = P;

    CL.forEach((cl, k) => { this.anchors['cluster:' + k] = cl.c.clone().add(v3(0, k === 3 || k === 6 ? 4 : 9, 0)); });
    this.libSections.forEach((s, b) => { this.anchors['lib:' + b] = s.top; });
    this.anchors.hero = HERO_POS.clone();
  }

  buildHero() {
    const m = new THREE.MeshBasicMaterial({ map: heroTexture(), transparent: true, side: THREE.DoubleSide, fog: false });
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.75 * 1.15, 1.15), m);
    h.position.copy(HERO_POS).add(v3(0, 0, 0.004));
    this.hero = h; this.scene.add(h);
  }

  buildScan() {
    // A translucent sheet that sweeps across the universe along x.
    const group = new THREE.Group();
    const add = (geo, mat, ry, y) => { const m = new THREE.Mesh(geo, mat); m.rotation.y = ry; m.position.y = y; group.add(m); return m; };
    const wallM = new THREE.MeshBasicMaterial({ color: 0x8fdcd2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const edgeM = new THREE.MeshBasicMaterial({ color: 0xd8fff4, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false });
    add(new THREE.PlaneGeometry(170, 50), wallM, Math.PI / 2, 12);
    add(new THREE.PlaneGeometry(170, 0.07), edgeM, Math.PI / 2, -8.9);
    add(new THREE.PlaneGeometry(170, 0.07), edgeM, Math.PI / 2, 37);
    const v = add(new THREE.PlaneGeometry(0.07, 50), edgeM, Math.PI / 2, 12); v.position.z = 0;
    this.scan = group; this.scanMats = [wallM, edgeM];
    this.scene.add(group);
  }

  // ---------------- graph ----------------
  buildGraph() {
    const nodes = [];
    const add = (key, p, size, col, kind, brand = -1, delay = 0) => { nodes.push({ key, p, size, col: new THREE.Color(col), kind, brand, delay }); this.anchors[key] = p; return p; };
    const core = add('core', v3(0, 17, 0), 220, '#f4efe6', 1, -1, 0);
    const reg = REGIONS.map((_, r) => add('region:' + r, regionPos(r), 120, '#8fa6b0', 1, -1, 0.3 + r * 0.02));
    const markets = [];
    REGIONS.forEach((_, r) => {
      for (let m = 0; m < 2; m++) {
        const a = (r / REGIONS.length) * Math.PI * 2 + 0.18 + (m ? 0.16 : -0.16);
        markets.push(add(`market:${r}:${m}`, v3(Math.sin(a) * 17, -5.2, Math.cos(a) * 17), 60, '#8fa6b0', 0, -1, 0.5));
      }
    });
    const usage = ['OOH', 'Social', 'Retail', 'Digital', 'Print'].map((u, k) => {
      const a = (k / 5) * Math.PI * 2 + 0.6;
      return add('usage:' + k, v3(Math.sin(a) * 5.5, -6.5, Math.cos(a) * 5.5), 80, '#f4efe6', 1, -1, 0.55);
    });
    const brandParts = BRANDS.map((b, bi) => {
      const H = add('brand:' + bi, hubPos(bi), 200, b.c, 1, bi, 0.1);
      const a = brandAngle(bi);
      const style = add('style:' + bi, v3(Math.sin(a) * 22, HUB_Y + 7, Math.cos(a) * 22), 70, b.c, 0, bi, 0.4);
      const guide = add('guide:' + bi, v3(Math.sin(a + 0.08) * 19, HUB_Y + 10.5, Math.cos(a + 0.08) * 19), 80, '#f4efe6', 1, bi, 0.45);
      const prods = [0, 1].map((k) => { const aa = a + (k ? 0.13 : -0.13); return add(`project:${bi}:${k}`, v3(Math.sin(aa) * 19.5, HUB_Y - 4.5, Math.cos(aa) * 19.5), 70, b.c, 0, bi, 0.4); });
      const camps = [0, 1, 2].map((c) => add(`campaign:${bi}:${c}`, campaignPos(bi, c), 120, '#f4efe6', 1, bi, 0.2 + c * 0.05));
      return { H, style, guide, prods, camps };
    });
    this.graphNodes = nodes;
    this.brandParts = brandParts; this.regionNodes = reg; this.usageNodes = usage; this.marketNodes = markets;

    const pos = [], pos3 = [], col = [], edge = [], brand = [];
    const r = rng(77);
    const E = (a, b, ca, cb, br, a3, b3) => {
      const seed = r();
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const A3 = a3 || a, B3 = b3 || b;
      pos3.push(A3.x, A3.y, A3.z, B3.x, B3.y, B3.z);
      col.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
      edge.push(0, seed, 1, seed); brand.push(br, br);
    };
    const W = new THREE.Color('#8fa6b0'), T = new THREE.Color('#8fdcd2');
    BRANDS.forEach((b, bi) => {
      const bc = new THREE.Color(b.c), P = brandParts[bi];
      E(core, P.H, W, bc, bi);
      P.camps.forEach((K) => E(P.H, K, bc, W, bi));
      P.prods.forEach((K) => E(P.H, K, bc, bc, bi));
      E(P.H, P.style, bc, bc, bi); E(P.style, P.guide, bc, W, bi);
      P.camps.forEach((K, c) => {
        const regs = new Set(this.assets.filter((a) => a.b === bi && a.c === c).slice(0, 60).map((a) => a.reg));
        [...regs].slice(0, 3 + (c === 0 ? 1 : 0)).forEach((rg) => E(K, reg[rg], W, T, bi));
        E(K, usage[(bi + c) % 5], W, W, bi);
      });
    });
    REGIONS.forEach((_, ri) => { E(reg[ri], markets[ri * 2], T, W, -1); E(reg[ri], markets[ri * 2 + 1], T, W, -1); });
    // asset edges (every other asset)
    const P2 = this.P[2], P3 = this.P[3];
    this.assets.forEach((a) => {
      if (a.i % 2 && a.i !== 0) return;
      const p2 = v3(P2[a.i * 3], P2[a.i * 3 + 1], P2[a.i * 3 + 2]);
      const p3 = v3(P3[a.i * 3], P3[a.i * 3 + 1], P3[a.i * 3 + 2]);
      const bc = new THREE.Color(BRANDS[a.b].c).multiplyScalar(0.7);
      E(a.K, p2, bc, bc, a.b, a.K, p3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aPos3', new THREE.Float32BufferAttribute(pos3, 3));
    g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aEdge', new THREE.Float32BufferAttribute(edge, 2));
    g.setAttribute('aBrand', new THREE.Float32BufferAttribute(brand, 1));
    this.edgeU = { uEco: { value: 0 }, uReveal: { value: 0 }, uTime: { value: 0 }, uFocus: { value: 0 }, uAlpha: { value: 0.16 }, uFog: { value: FOG_DENSITY } };
    const em = new THREE.ShaderMaterial({ vertexShader: EDGE_VS, fragmentShader: EDGE_FS, uniforms: this.edgeU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.edges = new THREE.LineSegments(g, em);
    this.edges.frustumCulled = false;
    this.scene.add(this.edges);

    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(nodes.flatMap((n) => [n.p.x, n.p.y, n.p.z]), 3));
    ng.setAttribute('aSize', new THREE.Float32BufferAttribute(nodes.map((n) => n.size), 1));
    ng.setAttribute('aCol', new THREE.Float32BufferAttribute(nodes.flatMap((n) => [n.col.r, n.col.g, n.col.b]), 3));
    ng.setAttribute('aDelay', new THREE.Float32BufferAttribute(nodes.map((n) => n.delay), 1));
    ng.setAttribute('aBrand', new THREE.Float32BufferAttribute(nodes.map((n) => n.brand), 1));
    ng.setAttribute('aKind', new THREE.Float32BufferAttribute(nodes.map((n) => n.kind), 1));
    this.nodeU = { uReveal: { value: 0 }, uFocus: { value: 0 }, uScale: { value: 1 }, uFog: { value: FOG_DENSITY * 0.8 }, uFogCol: { value: BG } };
    const nm = new THREE.ShaderMaterial({ vertexShader: NODE_VS, fragmentShader: NODE_FS, uniforms: this.nodeU, transparent: true, depthWrite: false });
    nm.extensions = { derivatives: true };
    this.nodes = new THREE.Points(ng, nm);
    this.nodes.frustumCulled = false;
    this.scene.add(this.nodes);

    // highlighted relationship path for one image
    const P = brandParts[HERO_BRAND];
    const heroP2 = v3(P2[0], P2[1], P2[2]);
    const se = markets[0];
    this.pathPts = [heroP2, P.prods[0], P.H, P.camps[0], reg[0], se, P.style, P.guide, usage[1]];
    this.pathPts.forEach((p, i) => { this.anchors['path:' + i] = p; });
    const curve = new THREE.CatmullRomCurve3(this.pathPts, false, 'centripetal', 0.5);
    const pts = curve.getPoints(this.pathPts.length * 24);
    this.pathLine = fatLine(pts, 0x16ffc6, 2.4, 0.95);
    this.pathSegs = pts.length - 1;
    this.pathLine.geometry.instanceCount = 0;
    this.scene.add(this.pathLine);
    const ringG = new THREE.RingGeometry(0.62, 0.7, 48);
    this.pathRings = this.pathPts.map((p) => {
      const m = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0x16ffc6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false }));
      m.position.copy(p); this.scene.add(m); return m;
    });
  }

  // ---------------- brand chamber: book, rules, skills ----------------
  buildChamber() {
    const grp = new THREE.Group(); grp.position.copy(C); this.scene.add(grp);
    this.chamber = grp;

    // guideline pages
    this.pages = GUIDE_PAGES.map((p, i) => {
      const m = new THREE.MeshStandardMaterial({ map: drawGuidePage(p, i), roughness: 0.85, metalness: 0, transparent: true, side: THREE.DoubleSide, envMapIntensity: 0.4 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3 / 0.7258), m);
      grp.add(mesh);
      return mesh;
    });

    // rule strips
    const NS = 72;
    const sg = new THREE.BoxGeometry(0.86, 0.07, 0.03);
    const sm_ = new THREE.MeshStandardMaterial({ color: 0xf4efe6, emissive: 0x8fdcd2, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.1, transparent: true });
    this.strips = new THREE.InstancedMesh(sg, sm_, NS);
    this.strips.frustumCulled = false;
    grp.add(this.strips);
    const r = rng(5);
    this.stripData = Array.from({ length: NS }, (_, i) => {
      const page = i % 6, skill = i % 9, k = Math.floor(i / 9);
      return { page, skill, k, ox: (r() - 0.5) * 1.5, oy: (r() - 0.5) * 2.4, tw: 0.4 + r() * 0.6 };
    });
    // logic lines
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 2 * 3 * 2), 3));
    this.logicLines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x8fdcd2, transparent: true, opacity: 0, depthWrite: false }));
    this.logicLines.frustumCulled = false;
    grp.add(this.logicLines);

    // skill modules
    const boxG = new RoundedBoxGeometry(2.1, 0.36, 1.44, 4, 0.1);
    const labelG = new THREE.PlaneGeometry(2.0, 1.375);
    const brand = BRANDS[HERO_BRAND];
    this.modules = SKILLS.map((s, i) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(boxG, new THREE.MeshPhysicalMaterial({ color: 0x1b252b, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.25, transparent: true }));
      const label = new THREE.Mesh(labelG, new THREE.MeshBasicMaterial({ map: skillLabelTexture(s, brand, 'v2.' + (i % 4 + 1)), transparent: true }));
      label.rotation.x = -Math.PI / 2; label.position.y = 0.181;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color(brand.c), transparent: true }));
      strip.position.set(0, -0.06, 0.725);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.9), new THREE.MeshBasicMaterial({ color: 0x16ffc6, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.rotation.x = -Math.PI / 2; glow.position.y = -0.2;
      g.add(body, label, strip, glow);
      g.userData = { body, label, strip, glow };
      grp.add(g);
      return g;
    });
    // brand core
    const core = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.22, 96), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(brand.c), metalness: 0.2, roughness: 0.25, clearcoat: 1, transparent: true }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: 0x8fdcd2, transparent: true }));
    ring.rotation.x = Math.PI / 2;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.012, 8, 220), new THREE.MeshBasicMaterial({ color: 0x8fa6b0, transparent: true, opacity: 0.4 }));
    ring2.rotation.x = Math.PI / 2;
    core.add(disc, ring, ring2);
    core.position.y = -0.5;
    core.userData = { mats: [disc.material, ring.material, ring2.material] };
    grp.add(core);
    this.core = core;
    // agent link lines inside chamber
    const al = new THREE.BufferGeometry();
    al.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 2 * 3), 3));
    this.agentLinks = new THREE.LineSegments(al, new THREE.LineBasicMaterial({ color: 0x16ffc6, transparent: true, opacity: 0, depthWrite: false }));
    this.agentLinks.frustumCulled = false;
    this.scene.add(this.agentLinks);
  }

  modulePose(i, stage, ring) {
    // stage-3 grid (standing) -> ring (flat)
    const col = i % 3, row = Math.floor(i / 3);
    const grid = v3((col - 1) * 2.55, 3.6 - row * 1.75, 1.2);
    const a = (i / 9) * Math.PI * 2;
    const ringP = v3(Math.sin(a) * 5.6, -0.4, Math.cos(a) * 4.6);
    const p = grid.clone().lerp(ringP, ease.io(ring));
    p.y += Math.sin(ease.io(ring) * Math.PI) * 1.2;
    const rx = lerp(Math.PI / 2, 0, ease.io(ring));
    return { p, rx };
  }

  buildMiniChambers() {
    const boxG = new RoundedBoxGeometry(2.1, 0.36, 1.44, 3, 0.1);
    const n = 5 * 9;
    this.miniBodies = new THREE.InstancedMesh(boxG, new THREE.MeshPhysicalMaterial({ color: 0x1b252b, metalness: 0.55, roughness: 0.35, clearcoat: 1 }), n);
    this.miniTops = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.9, 1.25), new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
    this.miniCores = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5, 1.5, 0.22, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, clearcoat: 1 }), 5);
    this.miniList = [];
    let k = 0, kc = 0;
    BRANDS.forEach((b, bi) => {
      if (bi === HERO_BRAND) return;
      const cp = chamberPos(bi);
      const ang = brandAngle(bi);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const local = v3(Math.sin(a) * 5.6, -0.4, Math.cos(a) * 4.6);
        this.miniList.push({ k: k++, p: cp.clone().add(local.applyAxisAngle(v3(0, 1, 0), ang)), ry: ang, col: new THREE.Color(b.c) });
      }
      this.miniCores.setColorAt(kc, new THREE.Color(b.c));
      const m = new THREE.Matrix4().compose(cp.clone().add(v3(0, -0.5, 0)), new THREE.Quaternion(), v3(1, 1, 1));
      this.miniCores.setMatrixAt(kc++, m);
      this.anchors['chamber:' + bi] = cp.clone().add(v3(0, 3, 0));
    });
    this.anchors['chamber:' + HERO_BRAND] = C.clone().add(v3(0, 3, 0));
    this.miniList.forEach((m) => { this.miniTops.setColorAt(m.k, m.col.clone().multiplyScalar(0.55)); });
    this.miniBodies.frustumCulled = this.miniTops.frustumCulled = this.miniCores.frustumCulled = false;
    this.scene.add(this.miniBodies, this.miniTops, this.miniCores);
  }

  buildAgents() {
    const mk = (s = 1) => {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42 * s, 0.035 * s, 12, 64), new THREE.MeshStandardMaterial({ color: 0xf4efe6, emissive: 0xf4efe6, emissiveIntensity: 0.25, metalness: 0.6, roughness: 0.25, transparent: true }));
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.62 * s, 0.008 * s, 6, 64), new THREE.MeshBasicMaterial({ color: 0x8fdcd2, transparent: true, opacity: 0.6 }));
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 20, 16), new THREE.MeshBasicMaterial({ color: 0x16ffc6, transparent: true }));
      g.add(ring, ring2, dot);
      g.userData = { mats: [ring.material, ring2.material, dot.material], ring, ring2 };
      this.scene.add(g);
      return g;
    };
    this.mainAgents = AGENTS.map(() => mk(1));
    this.miniAgents = [];
    BRANDS.forEach((b, bi) => { if (bi !== HERO_BRAND) for (let k = 0; k < 2; k++) this.miniAgents.push({ g: mk(0.9), b: bi, k }); });
    this.travelers = Array.from({ length: 6 }, () => mk(0.8));
  }

  // ---------------- generated creative ----------------
  buildCreative() {
    const L = creativeLayers();
    this.creativeTex = L;
    const H = 5.4, W = H * L.aspect;
    const grp = new THREE.Group();
    grp.position.copy(C).add(v3(0, 3.35, 0));
    this.scene.add(grp);
    this.creative = grp;
    const plane = (tex, z, opaque = false) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: opaque, side: THREE.DoubleSide, fog: false }));
      grp.add(m); return m;
    };
    // construction grid
    const gc = document.createElement('canvas'); gc.width = 360; gc.height = 640;
    const gg = gc.getContext('2d'); gg.strokeStyle = 'rgba(143,220,210,0.55)'; gg.lineWidth = 1.5;
    for (let k = 0; k <= 12; k++) { gg.beginPath(); gg.moveTo(18 + k * 27, 0); gg.lineTo(18 + k * 27, 640); gg.stroke(); }
    for (let k = 0; k <= 20; k++) { gg.globalAlpha = 0.35; gg.beginPath(); gg.moveTo(0, k * 32); gg.lineTo(360, k * 32); gg.stroke(); }
    const gtex = new THREE.CanvasTexture(gc);
    const frame = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W, H)), new THREE.LineBasicMaterial({ color: 0x8fdcd2, transparent: true }));
    grp.add(frame);
    this.layers = [
      { key: 'bg', mesh: plane(L.bg, 0, true), src: 2, fz: 0, ez: -2.2, ex: -0.5 },
      { key: 'grid', mesh: plane(gtex, 0.02), src: 3, fz: 0.02, ez: -1.4, ex: -0.3 },
      { key: 'model', mesh: this.makePavilion(H), src: 8, fz: 1.0, ez: -0.2, ex: 0.1, solid: true },
      { key: 'headline', mesh: plane(L.headline, 0.5), src: 0, fz: 0.5, ez: 1.1, ex: 0.3 },
      { key: 'logo', mesh: plane(L.logo, 0.52), src: 4, fz: 0.52, ez: 2.0, ex: 0.5 },
      { key: 'cta', mesh: plane(L.cta, 0.54), src: 6, fz: 0.54, ez: 2.8, ex: 0.7 },
      { key: 'disclaimer', mesh: plane(L.disclaimer, 0.56), src: 7, fz: 0.56, ez: 3.5, ex: 0.9 },
      { key: 'safe', mesh: plane(L.safe, 0.6), src: 3, fz: 0.6, ez: 4.2, ex: 1.1 },
    ];
    this.layers.filter((l) => l.solid).forEach((l) => grp.add(l.mesh));
    this.frameLine = frame;
    this.creativeSize = { W, H };
  }

  makePavilion(H) {
    // A cantilevered pavilion: travertine plinth, glass volume with a warm interior, thin roof slab on slender columns.
    const g = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0xd8cfbf, roughness: 0.75, metalness: 0, transparent: true });
    const roofM = new THREE.MeshStandardMaterial({ color: 0xefe9de, roughness: 0.55, metalness: 0, transparent: true });
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0x24343d, roughness: 0.04, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.5, envMapIntensity: 1.6 });
    const glowM = new THREE.MeshBasicMaterial({ color: 0xffcf96, transparent: true, opacity: 0.9 });
    const colM = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.5, metalness: 0.3, transparent: true });
    const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
    box(2.9, 0.06, 1.25, stone, 0, 0.03, 0);
    box(1.48, 0.56, 0.76, glowM, -0.12, 0.34, 0);
    box(1.56, 0.6, 0.84, glassM, -0.12, 0.36, 0);
    for (let k = 0; k <= 8; k++) box(0.012, 0.6, 0.86, colM, -0.9 + k * 0.195, 0.36, 0);
    [[-1.32, 0.5], [-1.32, -0.5], [1.32, 0.5], [1.32, -0.5]].forEach(([x, z]) => box(0.026, 0.62, 0.026, colM, x, 0.37, z));
    box(3.0, 0.08, 1.36, roofM, 0, 0.72, 0);
    g.userData.mats = [stone, glowM, glassM, colM, roofM];
    g.userData.base = [1, 0.9, 0.5, 1, 1];
    g.rotation.y = -0.18;
    g.position.set(0.08, -H * 0.2, 0);
    g.userData.home = g.position.clone();
    return g;
  }

  buildGovernance() {
    const names = ['Brand rules', 'Typography', 'Colour', 'Logo usage', 'Composition', 'Photography', 'Regional requirements', 'Campaign rules', 'Channel requirements', 'Approval permissions'];
    const { W, H } = this.creativeSize;
    this.sweeps = names.map((n) => {
      const g = new THREE.Group();
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 0.5, H + 0.5)), new THREE.LineBasicMaterial({ color: 0x8fdcd2, transparent: true, opacity: 0 }));
      const label = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.275), new THREE.MeshBasicMaterial({ map: ruleTexture(n), transparent: true, opacity: 0, depthWrite: false }));
      label.position.set(-(W + 0.5) / 2 + 1.1, (H + 0.5) / 2 + 0.25, 0);
      const fill = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.5, H + 0.5), new THREE.MeshBasicMaterial({ color: 0x8fdcd2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      g.add(frame, label, fill);
      g.userData = { frame, label, fill };
      this.creative.add(g);
      return g;
    });
  }

  // ---------------- loop: creative returns into the graph ----------------
  buildLoop() {
    const K = this.brandParts[HERO_BRAND].camps[0];
    const outward = v3(K.x, 0, K.z).normalize();
    this.loopTarget = K.clone().addScaledVector(outward, 2.6).add(v3(-1.6, 2.4, 0));
    this.anchors.loopcard = this.loopTarget;
    this.anchors.creative = this.creative.position.clone().add(v3(0, 3.1, 0));
    const tgt = this.loopTarget;
    const lines = [
      [tgt, K], [tgt, this.regionNodes[0]], [tgt, this.brandParts[HERO_BRAND].H], [tgt, this.usageNodes[1]],
    ];
    this.loopLines = lines.map(([a, b]) => {
      const mid = a.clone().lerp(b, 0.5).add(v3(0, 1.5, 0));
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(40);
      const l = fatLine(pts, 0x16ffc6, 1.8, 0.9);
      l.geometry.instanceCount = 0; this.scene.add(l); return l;
    });
    // learning pulse back to the brand chamber
    const learnPts = new THREE.QuadraticBezierCurve3(tgt, tgt.clone().lerp(C, 0.5).add(v3(0, 7, 0)), C.clone().add(v3(0, -0.3, 0))).getPoints(60);
    this.learnLine = fatLine(learnPts, 0xf4efe6, 1.4, 0.6);
    this.learnLine.geometry.instanceCount = 0;
    this.scene.add(this.learnLine);
    this.learnPts = learnPts;
    this.learnDot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0x16ffc6, transparent: true, opacity: 0 }));
    this.scene.add(this.learnDot);
  }

  buildFlow() {
    const n = 90, r = rng(91);
    this.flowData = Array.from({ length: n }, (_, i) => {
      const b = i % 6, c = Math.floor(r() * 3);
      const a = chamberPos(b).add(v3(0, 3, 0));
      const K = campaignPos(b, c);
      const ctrl = a.clone().lerp(K, 0.5).add(v3(0, 10 + r() * 6, 0));
      return { curve: new THREE.QuadraticBezierCurve3(a, ctrl, K), off: r(), speed: 0.06 + r() * 0.05, col: new THREE.Color(BRANDS[b].c).lerp(WARM, 0.35) };
    });
    this.flowMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), n);
    this.flowData.forEach((d, i) => this.flowMesh.setColorAt(i, d.col));
    this.flowMesh.frustumCulled = false;
    this.scene.add(this.flowMesh);
  }

  // ===================================================================
  apply(state, now = performance.now()) {
    const w = state.world || {};
    const dur = state.dur ?? 2.2;
    for (const k in DEFAULTS) {
      const spec = w[k] ?? DEFAULTS[k];
      if (typeof spec === 'number') this.params.set(k, spec, dur, 0, now);
      else this.params.set(k, spec.to, spec.dur ?? dur, spec.delay ?? 0, now, ease[spec.ease || 'io'], spec.from);
    }
    this.litSkills = new Set(state.lit || []);
    if (state.cam) this.camTo(state.cam, state.instant ? 0 : (state.cam.dur ?? dur), now);
  }

  camTo(c, dur, now) {
    // bake current orbit rotation into the start pose
    const cur = this.currentCam();
    this.cam.pos.copy(cur.pos); this.cam.tgt.copy(cur.tgt);
    this.orbit.angle = 0;
    this.orbit.speed = c.orbit || 0;
    this.orbit.driftTo = c.drift ?? 0.25;
    const to = { pos: v3(...c.pos), tgt: v3(...c.tgt), fov: c.fov ?? 36, shift: c.shift ?? 0 };
    if (dur <= 0) { Object.assign(this.cam, { pos: to.pos, tgt: to.tgt, fov: to.fov, shift: to.shift }); this.camTween = null; return; }
    this.camTween = { from: { pos: this.cam.pos.clone(), tgt: this.cam.tgt.clone(), fov: this.cam.fov, shift: this.cam.shift }, to, t0: now, dur: dur * 1000, lift: c.lift ?? 0, e: ease[c.ease || 'io'] };
  }

  currentCam() {
    const off = this.cam.pos.clone().sub(this.cam.tgt).applyAxisAngle(v3(0, 1, 0), this.orbit.angle);
    return { pos: this.cam.tgt.clone().add(off), tgt: this.cam.tgt.clone() };
  }

  resize(w, h) {
    if (this.failed) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.size = { w, h };
    const res = new THREE.Vector2(w * this.renderer.getPixelRatio(), h * this.renderer.getPixelRatio());
    [this.pathLine, ...this.loopLines, this.learnLine].forEach((l) => l.material.resolution.copy(res));
    this.nodeU.uScale.value = h * this.renderer.getPixelRatio() / 900 * 6;
  }

  project(key, out) {
    const p = this.anchors[key];
    if (!p) return null;
    const v = (p.isVector3 ? p : p()).clone().project(this.camera);
    out.x = (v.x * 0.5 + 0.5) * 1920; out.y = (-v.y * 0.5 + 0.5) * 1080; out.vis = v.z < 1 && v.z > -1;
    return out;
  }

  update(now) {
    if (this.failed) return;
    const dt = Math.min(0.05, (now - this.now) / 1000);
    this.now = now; this.time += dt;
    const P = this.params; P.update(now);
    const g = (k) => P.get(k);
    const t = this.time;

    // camera
    if (this.camTween) {
      const tw = this.camTween;
      const k = clamp01((now - tw.t0) / tw.dur), e = tw.e(k);
      this.cam.pos.lerpVectors(tw.from.pos, tw.to.pos, e);
      this.cam.tgt.lerpVectors(tw.from.tgt, tw.to.tgt, e);
      const d = tw.from.pos.distanceTo(tw.to.pos);
      this.cam.pos.y += Math.sin(Math.PI * e) * tw.lift * Math.min(1, d / 30);
      this.cam.fov = lerp(tw.from.fov, tw.to.fov, e);
      this.cam.shift = lerp(tw.from.shift, tw.to.shift, e);
      if (k >= 1) this.camTween = null;
    }
    this.orbit.drift = lerp(this.orbit.drift, this.orbit.driftTo ?? 0.25, 0.02);
    this.orbit.angle += this.orbit.speed * dt;
    const cc = this.currentCam();
    const dr = this.orbit.drift;
    cc.pos.add(v3(Math.sin(t * 0.21) * dr, Math.sin(t * 0.17 + 1) * dr * 0.6, Math.cos(t * 0.13) * dr * 0.5));
    const cam = this.camera;
    cam.position.copy(cc.pos); cam.lookAt(cc.tgt);
    cam.fov = this.cam.fov;
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    cam.filmGauge = 35;
    // shift > 0 moves the camera target to the right of frame by shift x frame width
    cam.filmOffset = -this.cam.shift * 35 * cam.aspect * 2 * tanH;
    cam.updateProjectionMatrix();
    const focusDist = cc.pos.distanceTo(cc.tgt);

    // assets
    this.chaosT += dt * g('chaosRate');
    const U = this.cardU;
    U.uLayout.value = g('layout'); U.uChaosT.value = this.chaosT;
    U.uScanX.value = g('scanX'); U.uScanOn.value = g('scanOn'); U.uRecog.value = g('recog');
    U.uFocus.value = g('focus'); U.uDim.value = g('dim'); U.uHero.value = g('hero');
    U.uBrackets.value = g('brackets');
    U.uFocusDist.value = focusDist; U.uFocusRange.value = g('dof');
    this.hero.material.opacity = g('hero');
    this.hero.visible = g('hero') > 0.001;

    this.grid.material.uniforms.uAlpha.value = g('grid');
    this.grid.material.uniforms.uCam.value.copy(cam.position);
    this.dust.rotation.y = t * 0.004;

    // scan
    this.scan.visible = g('scanOn') > 0.01;
    this.scan.position.x = g('scanX');
    this.scanMats[0].opacity = 0.05 * g('scanOn'); this.scanMats[1].opacity = 0.6 * g('scanOn');

    // graph
    const layout = g('layout');
    this.edgeU.uEco.value = clamp01(layout - 2);
    this.edgeU.uReveal.value = g('graph'); this.edgeU.uTime.value = t; this.edgeU.uFocus.value = g('focus');
    this.nodeU.uReveal.value = g('graph'); this.nodeU.uFocus.value = g('focus');
    this.edges.visible = this.nodes.visible = g('graph') > 0.001;
    const pth = g('path');
    this.pathLine.visible = pth > 0.001;
    this.pathLine.geometry.instanceCount = Math.floor(clamp01(pth) * this.pathSegs);
    this.pathRings.forEach((m, i) => {
      const on = sm(i / 8 - 0.02, i / 8 + 0.06, pth);
      m.material.opacity = on * 0.9 * (pth > 0 ? 1 : 0);
      m.visible = m.material.opacity > 0.01;
      m.lookAt(cam.position);
      m.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.06);
    });

    this.updateChamber(g, t, cam);
    this.updateAgents(g, t);
    this.updateCreative(g, t);
    this.updateLoop(g, t);
    this.updateFlow(g, t);

    this.renderer.render(this.scene, cam);
  }

  updateChamber(g, t, cam) {
    const book = g('book'), stage = g('stage'), skills = g('skills'), ring = g('ring'), core = g('core');
    const chamberVis = book > 0.001 || skills > 0.001 || core > 0.001;
    this.chamber.visible = chamberVis;
    if (!chamberVis) return;
    // pages
    this.pages.forEach((p, i) => {
      const o = i - 2.5;
      const fan = v3(o * 1.42, 2.4 - Math.abs(o) * 0.08, -1.2 - Math.abs(o) * 0.35);
      const back = v3(o * 1.7, 3.4, -4.2);
      const k = sm(0, 1, stage);
      p.position.lerpVectors(fan, back, k);
      p.position.y += Math.sin(t * 0.6 + i) * 0.04;
      p.rotation.set(lerp(0, -0.2, k), -o * 0.13 * (1 - k), 0);
      p.material.opacity = book * lerp(1, 0.16, k) * (1 - sm(2.4, 3.2, stage) * 0.7);
      p.visible = p.material.opacity > 0.005;
    });
    // strips
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = v3(1, 1, 1);
    let lpos = this.logicLines.geometry.attributes.position.array, li = 0;
    const stripPos = [];
    this.stripData.forEach((s, i) => {
      const po = s.page - 2.5;
      const onPage = v3(po * 1.42 + s.ox * 0.7, 2.4 + s.oy * 0.9, -1.0);
      const col = s.page, row = Math.floor(i / 6);
      const table = v3((col - 2.5) * 1.12, 4.1 - row * 0.27, 1.2);
      const lcol = s.skill, lrow = s.k;
      const logic = v3((lcol - 4) * 0.98, 3.6 - lrow * 0.34 + (lcol % 2) * 0.17, 1.6);
      const mp = this.modulePose(s.skill, 3, 0).p;
      let p, scale;
      if (stage <= 1) { const k = ease.io(sm(i / 72 * 0.5, i / 72 * 0.5 + 0.5, stage)); p = onPage.clone().lerp(table, k); scale = k; }
      else if (stage <= 2) { const k = ease.io(sm(0, 1, stage - 1)); p = table.clone().lerp(logic, k); p.z += Math.sin(k * Math.PI) * 0.8; scale = 1; }
      else { const k = ease.io(sm(0, 0.8, stage - 2)); p = logic.clone().lerp(mp, k); scale = 1 - k; }
      p.y += Math.sin(t * 1.4 + i) * 0.015;
      sc.set(scale * s.tw * 1.2 + 0.0001, scale + 0.0001, scale + 0.0001);
      m4.compose(p, q, sc);
      this.strips.setMatrixAt(i, m4);
      stripPos[i] = p;
    });
    this.strips.instanceMatrix.needsUpdate = true;
    this.strips.material.opacity = book;
    this.strips.visible = stage > 0.01 && stage < 3 && book > 0.01;
    // logic lines connect strips within each skill column, plus a few cross links
    const logicA = sm(1.3, 2, stage) * (1 - sm(2.2, 2.8, stage));
    this.logicLines.material.opacity = logicA * 0.75 * book;
    this.logicLines.visible = logicA > 0.01;
    if (this.logicLines.visible) {
      for (let s = 0; s < 9; s++) {
        const col = this.stripData.map((d, i) => (d.skill === s ? i : -1)).filter((i) => i >= 0).sort((a, b) => this.stripData[a].k - this.stripData[b].k);
        for (let k = 0; k < col.length - 1; k++) {
          const a = stripPos[col[k]], b = stripPos[col[k + 1]];
          lpos.set([a.x - 0.43, a.y, a.z, b.x - 0.43, b.y, b.z], li); li += 6;
        }
        if (s < 8) { const a = stripPos[col[1]], b = stripPos[this.stripData.findIndex((d) => d.skill === s + 1 && d.k === 3)]; lpos.set([a.x + 0.43, a.y, a.z, b.x - 0.43, b.y, b.z], li); li += 6; }
      }
      this.logicLines.geometry.setDrawRange(0, li / 3);
      this.logicLines.geometry.attributes.position.needsUpdate = true;
    }
    // modules
    const modA = Math.max(sm(2.4, 3.0, stage) * book, skills);
    this.modules.forEach((m, i) => {
      const pose = this.modulePose(i, stage, ring);
      m.position.copy(pose.p);
      m.position.y += Math.sin(t * 0.8 + i * 0.7) * 0.05;
      m.rotation.set(pose.rx, 0, 0);
      const appear = ease.out(sm(2.4 + i * 0.04, 2.9 + i * 0.04, stage));
      const s = skills > 0.001 ? 1 : appear;
      m.scale.setScalar(0.001 + s);
      const lit = this.litSkills.has(i) ? 1 : 0;
      this.litLevel[i] = lerp(this.litLevel[i], lit, 0.08);
      const ud = m.userData;
      ud.body.material.opacity = modA; ud.label.material.opacity = modA * (0.55 + 0.45 * (this.litSkills.size ? 0.4 + this.litLevel[i] * 0.6 : 1));
      ud.strip.material.opacity = modA;
      ud.glow.material.opacity = this.litLevel[i] * 0.1 * modA * (0.8 + 0.2 * Math.sin(t * 3 + i));
      m.visible = modA > 0.005;
    });
    this.anchorsSkills();
    // core
    this.core.visible = core > 0.001;
    this.core.scale.setScalar(0.6 + 0.4 * ease.out(core));
    this.core.userData.mats[0].opacity = core;
    this.core.userData.mats[1].opacity = core * 0.8;
    this.core.userData.mats[2].opacity = core * 0.35;
    this.core.children[1].rotation.z = t * 0.2;
  }

  anchorsSkills() {
    this.modules.forEach((m, i) => { (this.anchors['skill:' + i] ||= v3()).copy(m.position).add(C).add(v3(0, 0.25, 0)); });
  }

  updateAgents(g, t) {
    const ag = g('agents'), mini = g('mini'), trav = g('travelers'), stage = g('stage'), book = g('book');
    // a single agent appears in the codification sequence (stage 4)
    const firstAgent = sm(3.3, 4, stage) * book;
    const links = this.agentLinks.geometry.attributes.position.array;
    let li = 0;
    this.mainAgents.forEach((a, i) => {
      let vis = i === 0 ? Math.max(firstAgent, ag) : ag;
      const ang = t * (0.16 + i * 0.03) + (i / 4) * Math.PI * 2;
      const orbitP = C.clone().add(v3(Math.sin(ang) * 7.4, 4.2 + Math.sin(t * 0.7 + i) * 0.5, Math.cos(ang) * 5.8));
      const frontP = C.clone().add(v3(0, 5.3, 1.8));
      const p = i === 0 ? frontP.lerp(orbitP, ag) : orbitP;
      a.position.copy(p);
      a.lookAt(this.camera.position);
      a.userData.ring.rotation.z = t * 0.8;
      a.userData.ring2.rotation.x = t * 0.5;
      a.scale.setScalar(0.001 + ease.out(vis));
      a.userData.mats.forEach((m) => (m.opacity = vis));
      a.visible = vis > 0.005;
      this.anchors['agent:' + i] = p.clone().add(v3(0, 0.9, 0));
      if (vis > 0.01) {
        const skills = i === 0 && ag < 0.5 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : AGENTS[i].skills;
        const active = ag < 0.5 && i === 0 ? skills : [skills[Math.floor(t * 0.7 + i) % skills.length], skills[Math.floor(t * 0.7 + i + 1) % skills.length]];
        active.forEach((s) => {
          if (li + 6 > links.length) return;
          const m = this.anchors['skill:' + s] || C;
          links.set([p.x, p.y, p.z, m.x, m.y, m.z], li); li += 6;
        });
      }
    });
    this.agentLinks.geometry.setDrawRange(0, li / 3);
    this.agentLinks.geometry.attributes.position.needsUpdate = true;
    this.agentLinks.material.opacity = Math.max(firstAgent, ag) * 0.45 * (0.75 + 0.25 * Math.sin(t * 4));
    this.agentLinks.visible = li > 0;

    // mini chambers
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    const show = mini > 0.001;
    this.miniBodies.visible = this.miniTops.visible = this.miniCores.visible = show;
    if (show) {
      this.miniList.forEach((m) => {
        const s = ease.out(sm(m.k / 45 * 0.5, m.k / 45 * 0.5 + 0.5, mini));
        const p = m.p.clone(); p.y += Math.sin(t * 0.8 + m.k) * 0.05 - (1 - s) * 2;
        q.setFromEuler(new THREE.Euler(0, m.ry, 0));
        m4.compose(p, q, v3(s + 0.001, s + 0.001, s + 0.001));
        this.miniBodies.setMatrixAt(m.k, m4);
        const tp = p.clone().add(v3(0, 0.182 * s, 0));
        q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, m.ry, 'YXZ'));
        m4.compose(tp, q, v3(s + 0.001, s + 0.001, 1));
        this.miniTops.setMatrixAt(m.k, m4);
      });
      this.miniBodies.instanceMatrix.needsUpdate = this.miniTops.instanceMatrix.needsUpdate = true;
      const cs = ease.out(mini);
      for (let k = 0; k < 5; k++) {
        this.miniCores.getMatrixAt(k, m4);
        const p = v3().setFromMatrixPosition(m4);
        m4.compose(p, new THREE.Quaternion(), v3(cs + 0.001, 1, cs + 0.001));
        this.miniCores.setMatrixAt(k, m4);
      }
      this.miniCores.instanceMatrix.needsUpdate = true;
    }
    this.miniAgents.forEach((a, i) => {
      const cp = chamberPos(a.b);
      const ang = t * (0.2 + a.k * 0.05) + a.k * Math.PI;
      a.g.position.copy(cp).add(v3(Math.sin(ang) * 7.6, 3.2 + Math.sin(t + i) * 0.5, Math.cos(ang) * 6.6));
      a.g.lookAt(this.camera.position);
      a.g.scale.setScalar(0.001 + mini);
      a.g.userData.mats.forEach((m) => (m.opacity = mini));
      a.g.visible = mini > 0.005;
    });
    this.travelers.forEach((a, i) => {
      const ph = (t * 0.05 + i / 6) % 1;
      const b0 = (i + Math.floor(t * 0.05 + i / 6)) % 6, b1 = (b0 + 1 + (i % 2)) % 6;
      const p0 = chamberPos(b0).add(v3(0, 5, 0)), p1 = chamberPos(b1).add(v3(0, 5, 0));
      const mid = p0.clone().lerp(p1, 0.5).multiplyScalar(0.55); mid.y = 24;
      const e = ease.sine(ph);
      const p = new THREE.QuadraticBezierCurve3(p0, mid, p1).getPoint(e);
      a.position.copy(p); a.lookAt(this.camera.position);
      const vis = trav * sm(0, 0.08, ph) * (1 - sm(0.92, 1, ph));
      a.scale.setScalar(0.001 + vis * 1.4);
      a.userData.mats.forEach((m) => (m.opacity = vis));
      a.visible = vis > 0.005;
    });
  }

  updateCreative(g, t) {
    const vis = g('creative'), build = g('build'), explode = g('explode'), govern = g('govern'), fix = g('fix'), loop = g('loop');
    this.creative.visible = vis > 0.001;
    if (!this.creative.visible) return;
    const { H } = this.creativeSize;
    const grpPos = C.clone().add(v3(0, 3.35, 0));
    // loop flight
    const lk = ease.io(clamp01(loop));
    if (lk > 0) {
      const mid = grpPos.clone().lerp(this.loopTarget, 0.5).add(v3(0, 12, 0));
      const p = new THREE.QuadraticBezierCurve3(grpPos, mid, this.loopTarget).getPoint(lk);
      this.creative.position.copy(p);
      const s = lerp(1, 0.13, lk);
      this.creative.scale.setScalar(s);
      this.creative.rotation.y = Math.sin(lk * Math.PI) * 0.6;
    } else {
      this.creative.position.copy(grpPos);
      this.creative.scale.setScalar(1);
      this.creative.rotation.y = 0;
    }
    this.frameLine.material.opacity = vis * (1 - build * 0.6);
    this.layers.forEach((L, i) => {
      const n = this.layers.length;
      const k = ease.out(sm(i / n * 0.6, i / n * 0.6 + 0.4, build));
      const srcLocal = (this.anchors['skill:' + L.src] || C).clone().sub(this.creative.position);
      const ex = v3(L.ex * 1.0, 0, L.ez);
      const fin = v3(0, 0, L.fz);
      const placed = fin.clone().lerp(ex, ease.io(explode));
      const p = srcLocal.lerp(placed, k);
      p.y += Math.sin(k * Math.PI) * 1.5;
      const mesh = L.mesh;
      if (L.solid) { mesh.position.copy(p).add(mesh.userData.home.clone().setZ(0)); }
      else mesh.position.copy(p);
      const s = 0.15 + 0.85 * k;
      mesh.scale.setScalar(s);
      let op = vis * sm(0, 0.3, k);
      if (L.key === 'disclaimer') op *= fix;
      if (L.key === 'grid') op *= g('cgrid');
      if (L.key === 'safe') op *= g('safe');
      if (L.solid) mesh.userData.mats.forEach((m, j) => (m.opacity = op * mesh.userData.base[j]));
      else mesh.material.opacity = op;
      mesh.visible = op > 0.005;
    });
    // governance sweeps
    const n = this.sweeps.length;
    this.sweeps.forEach((s, i) => {
      const a = i / n * 0.85, k = clamp01((govern - a) / 0.18);
      const on = govern > 0 && k > 0 && k < 1;
      const z = lerp(3.4, -1.6, ease.io(k));
      s.position.set(0, 0, z);
      const env = Math.sin(k * Math.PI);
      const amber = i === 6 && k > 0.35 && fix < 0.5;
      s.userData.frame.material.color.set(amber ? 0xf0b45a : 0x8fdcd2);
      s.userData.frame.material.opacity = on ? env * 0.95 * vis : 0;
      s.userData.label.material.opacity = on ? env * vis : 0;
      s.userData.fill.material.opacity = on ? env * 0.05 * vis : 0;
      s.visible = on;
    });
  }

  updateLoop(g, t) {
    const links = g('links');
    this.loopLines.forEach((l, i) => {
      const k = clamp01((links - i * 0.15) / 0.55);
      l.geometry.instanceCount = Math.floor(k * 40);
      l.visible = k > 0;
    });
    const learn = clamp01((links - 0.6) / 0.4);
    this.learnLine.geometry.instanceCount = Math.floor(learn * 60);
    this.learnLine.visible = learn > 0;
    if (learn >= 1) {
      const ph = (t * 0.35) % 1;
      const idx = Math.floor(ph * (this.learnPts.length - 1));
      this.learnDot.position.copy(this.learnPts[idx]);
      this.learnDot.material.opacity = Math.sin(ph * Math.PI);
      this.learnDot.visible = true;
    } else this.learnDot.visible = false;
  }

  updateFlow(g, t) {
    const f = g('flow');
    this.flowMesh.visible = f > 0.001;
    if (!this.flowMesh.visible) return;
    this.flowMesh.material.opacity = f * 0.9;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    this.flowData.forEach((d, i) => {
      const ph = (t * d.speed + d.off) % 1;
      const p = d.curve.getPoint(ph);
      const s = Math.sin(ph * Math.PI) * 1.0 + 0.001;
      q.setFromEuler(new THREE.Euler(-0.4, t * 0.6 + i, 0, 'YXZ'));
      m4.compose(p, q, v3(s, s, s));
      this.flowMesh.setMatrixAt(i, m4);
    });
    this.flowMesh.instanceMatrix.needsUpdate = true;
  }
}
