import { BRANDS, REGIONS, STORAGE, SKILLS, AGENTS } from './data.js';
import { C } from './world.js';

const c = (dx, dy, dz) => [C.x + dx, C.y + dy, C.z + dz];
const chips = (arr) => arr.map((s) => `<span class="chip-s">${s}</span>`).join('');

// Statement typography used at conceptual transitions.
function statement(a, verb, b) {
  return `
    <div class="statement">
      <p class="statement__a" data-from="0">${a}</p>
      <p class="statement__verb" data-from="0">${verb}</p>
      <p class="statement__b" data-from="0">${b}</p>
    </div>`;
}

const LIB_COUNTS = [402118, 377940, 431806, 396215, 409772, 395055];

export const SLIDES = [
  // ------------------------------------------------------------------ cover
  {
    id: 'cover', menu: 'Cover', kind: 'cover',
    html: `
      <div class="cover">
        <p class="eyebrow">For discussion · October 2026</p>
        <div class="cover__body">
          <h1 class="cover__title">Marketing Assets <em>Intelligence System</em></h1>
          <p class="cover__sub">An intelligent creative operating system for multi-brand architecture and design groups.</p>
        </div>
        <div class="cover__foot">
          <div class="cover__rule"></div>
          <div class="cover__meta"><span>Concept prototype</span><span class="mono">Press → to begin · P to play</span></div>
        </div>
      </div>`,
    states: [{
      cam: { pos: [0.02, 4.03, 32.25], tgt: [0, 4, 30], fov: 36, shift: 0.24, drift: 0.04 },
      world: { hero: 1, dof: 5, chaosRate: 0.6, grid: 0.25 },
    }],
    hold: [6],
  },

  // ------------------------------------------------------------------ 01
  {
    id: 'fragmented', menu: 'Fragmented universe', chapter: '01',
    eyebrow: 'Chapter 01 · The starting point',
    title: 'Fragmented Universe',
    support: 'Every studio and region has built its own archives, project folders, conventions and storage over many years.',
    html: `
      <div class="stats" data-from="1">
        ${[['2.4M', 'creative assets'], ['14', 'storage systems'], ['6', 'studio brands'], ['9', 'regions'], ['31', 'naming conventions']].map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}
        <p class="note">Illustrative figures for a design group with six architecture studios.</p>
      </div>`,
    labels: (s) => (s >= 1 ? STORAGE.map((st, k) => ({ key: 'cluster:' + k, text: `${st.label} · ${st.sub}`, sub: `${st.files} files` })) : []),
    states: [
      { cam: { pos: [3, 6.5, 44], tgt: [0, 4, 24], fov: 40, lift: 2 }, world: { hero: { to: 0, dur: 1.4 }, dof: 30, chaosRate: 1.6, grid: 0.35 }, dur: 3 },
      { cam: { pos: [12, 32, 104], tgt: [0, 9, -6], fov: 40, lift: 6 }, world: { chaosRate: 1.6, dof: 90, grid: 0.4 }, dur: 3.6 },
    ],
    hold: [5, 7],
  },

  // ------------------------------------------------------------------ 02
  {
    id: 'sees', menu: 'Asset understanding', chapter: '02',
    eyebrow: 'Chapter 02 · The system sees',
    title: 'Asset Understanding',
    support: 'Vision and language models read the contents of every file, so each asset is described by what it shows.',
    html: `
      <div class="counter" data-from="0">
        <span class="mono-label">Assets analysed</span>
        <b class="js-count" data-to="2412906" data-dur="7000">0</b>
        <span class="mono-sub">of 2,412,906 · 14 sources connected</span>
      </div>
      <aside class="panel analysis" data-from="0">
        <header class="panel__head"><span>Global creative index</span><span class="live"><i></i>Analysing</span></header>
        <div class="analysis__body">
          <div class="analysis__shot">
            <canvas class="js-hero-poster" width="300" height="400"></canvas>
            <div class="bbox" style="left:16px;top:38px;width:186px;height:72px"><span>Headline · 0.99</span></div>
            <div class="bbox" style="left:14px;top:188px;width:276px;height:94px"><span>Building · 0.98</span></div>
            <div class="bbox" style="left:12px;top:342px;width:44px;height:44px"><span>Logo · 0.97</span></div>
            <div class="bbox bbox--wide" style="left:6px;top:286px;width:288px;height:44px"><span>Reflection · water</span></div>
          </div>
          <dl class="attrs">
            <div><dt>Objects</dt><dd>Pavilion, cantilevered roof, water</dd></div>
            <div><dt>Project</dt><dd>Harbour Pavilion, cultural, 2026</dd></div>
            <div><dt>Logo</dt><dd>Studio 03 arch mark, clear space met</dd></div>
            <div><dt>Typography</dt><dd>Display 600, sentence case</dd></div>
            <div><dt>Palette</dt><dd class="sw"><i style="background:#16384a"></i><i style="background:#5c93ad"></i><i style="background:#e9b892"></i><i style="background:#f3d8bf"></i><i style="background:#4e9bc4"></i></dd></div>
            <div><dt>Layout</dt><dd>Building on lower third, copy top left</dd></div>
            <div><dt>Scene</dt><dd>Dusk on water, interior lit</dd></div>
            <div><dt>Campaign</dt><dd>Pavilion launch <em>inferred 0.93</em></dd></div>
            <div><dt>Region</dt><dd>Nordics <em>inferred 0.88</em></dd></div>
            <div><dt>Related</dt><dd>214 renders, drawings and photographs</dd></div>
          </dl>
        </div>
      </aside>`,
    states: [{
      cam: { pos: [-30, 16, 76], tgt: [6, 5, -4], fov: 40, shift: -0.17, lift: 4 },
      world: { chaosRate: 0.3, scanX: { from: -78, to: 72, dur: 7, ease: 'lin' }, scanOn: 1, recog: 1, brackets: 1, dof: 90, grid: 0.4 },
      dur: 2.6,
    }],
    hold: [9],
  },

  // ------------------------------------------------------------------ statement
  {
    id: 's1', menu: 'Structured knowledge', kind: 'statement',
    html: statement('Fragmented creative intelligence', 'becomes', '<em>structured knowledge</em>'),
    states: [{
      cam: { pos: [0, 22, 54], tgt: [0, 6, -18], fov: 46, lift: 6, drift: 0.4 },
      world: { layout: { to: 1, dur: 5.2 }, chaosRate: 0.15, recog: 1, dim: 0.55, dof: 90, grid: 0.4 },
      dur: 4.2,
    }],
    hold: [6],
  },

  // ------------------------------------------------------------------ 03
  {
    id: 'library', menu: 'Organised library', chapter: '03',
    eyebrow: 'Chapter 03 · Chaos becomes structure',
    title: 'Organised Library',
    support: 'Assets arrange themselves by studio, project and type, using the meaning the system extracted from each one.',
    html: `
      <div class="panel taxonomy" data-from="0">
        <header class="panel__head"><span>Taxonomy</span><span>v1.0</span></header>
        <div class="crumbs">${['Studio', 'Project', 'Region', 'Channel', 'Asset type'].map((s, i) => `<span>${s}</span>${i < 4 ? '<i>→</i>' : ''}`).join('')}</div>
        <div class="tx-rows">
          <div><span>Naming conventions reconciled</span><b>31 → 1</b></div>
          <div><span>Duplicate files found</span><b>186,402</b></div>
          <div><span>Metadata fields written</span><b>9.6M</b></div>
          <div><span>Assets with rights expiring this quarter</span><b>3,914</b></div>
        </div>
      </div>`,
    labels: () => BRANDS.map((b, i) => ({ key: 'lib:' + i, text: `${b.name} · ${b.cat}`, sub: `${LIB_COUNTS[i].toLocaleString('en-GB')} assets`, color: b.c })),
    states: [{
      cam: { pos: [0, 12, 30], tgt: [0, 5.5, -30], fov: 52, drift: 0.35 },
      world: { layout: 1, chaosRate: 0, recog: 1, dof: 120, grid: 0.5 },
      dur: 3,
    }],
    hold: [7],
  },

  // ------------------------------------------------------------------ 04
  {
    id: 'graph', menu: 'Creative graph', chapter: '04',
    eyebrow: 'Chapter 04 · The creative graph',
    title: 'Creative Graph',
    support: 'Studios, projects, campaigns, regions and guidelines become nodes in one connected map of the organisation.',
    html: `
      <div class="chain" data-from="1">
        <p class="chain__cap">One launch render traced through nine relationships the system discovered.</p>
        <ol>${['Image', 'Project', 'Brand', 'Campaign', 'Region', 'Market', 'Style', 'Guideline', 'Usage'].map((s, i) => `<li style="--d:${(i * 0.42).toFixed(2)}s"><span>${String(i + 1).padStart(2, '0')}</span>${s}</li>`).join('')}</ol>
      </div>`,
    labels: (s) => {
      if (s === 0) {
        return [
          { key: 'core', text: 'Design group', sub: '6 studios · 18 campaigns' },
          ...BRANDS.map((b, i) => ({ key: 'brand:' + i, text: b.name, sub: b.cat, color: b.c })),
          ...REGIONS.map((r, i) => ({ key: 'region:' + i, text: r, cls: 'is-quiet' })),
        ];
      }
      const t = ['Launch render · dusk', 'Harbour Pavilion', 'Studio 03', 'Pavilion launch', 'Nordics', 'Norway', 'Dusk on water', 'Photography · p.05', 'Social'];
      const k = ['Image', 'Project', 'Brand', 'Campaign', 'Region', 'Market', 'Style', 'Guideline', 'Usage'];
      return t.map((x, i) => ({ key: 'path:' + i, text: x, sub: k[i], cls: 'is-path' + (i === 0 ? ' is-left' : ''), delay: i * 0.42 }));
    },
    states: [
      { cam: { pos: [0, 42, 78], tgt: [0, 4, 0], fov: 40, lift: 10, drift: 0.4 }, world: { layout: { to: 2, dur: 4.4 }, graph: { to: 1, dur: 4, delay: 1 }, recog: 1, dof: 140, grid: 0.4 }, dur: 3.6 },
      { cam: { pos: [20, 20, 66], tgt: [-1, 6, 16], fov: 40 }, world: { layout: 2, graph: 1, path: { to: 1, dur: 3.8, delay: 0.6, ease: 'lin' }, recog: 1, dof: 140, grid: 0.4 }, dur: 2.4 },
    ],
    hold: [7, 8],
  },

  // ------------------------------------------------------------------ statement
  {
    id: 's2', menu: 'Brand intelligence', kind: 'statement',
    html: statement('Structured knowledge', 'becomes', '<em>machine-readable brand intelligence</em>'),
    states: [{
      cam: { pos: [-6, 15, 80], tgt: [0, 8, 40], fov: 42, lift: 4, drift: 0.3 },
      world: { layout: 2, graph: 1, focus: 1, recog: 1, dim: 0.35, dof: 140, grid: 0.35 },
      dur: 3.4,
    }],
    hold: [5],
  },

  // ------------------------------------------------------------------ 05
  {
    id: 'codify', menu: 'Codified guidelines', chapter: '05',
    eyebrow: 'Chapter 05 · Guidelines become intelligence',
    title: 'Codified Guidelines',
    support: 'The 48-page Studio 03 guideline is translated into rules that software can check and apply.',
    html: `
      <ol class="beats">
        ${[
          ['Human guideline', `<blockquote>“Basalt leads every layout. Copper is an accent and never covers more than 15 per cent of a frame.”</blockquote><p class="src">Studio 03 guidelines · page 03</p>`],
          ['Structured rules', `<pre><b>rule</b>: colour.accent_coverage
<b>applies_to</b>: [static, motion]
<b>measure</b>: area_ratio(copper)
<b>max</b>: 0.15
<b>severity</b>: block</pre>`],
          ['Creative logic', `<pre><b>if</b> channel == "ooh" <b>and</b> region == "nordics":
    require(planning_disclaimer)
<b>if</b> photo.people.staged:
    reject("guideline 05")
photo.verticals == "corrected"</pre>`],
          ['Machine-readable skills', `<pre><b>skill</b>: studio03.colour
<b>version</b>: 2.4
<b>inputs</b>: [layout, palette, channel]
<b>rules</b>: 18    <b>checks</b>: 9
<b>examples</b>: 412 approved assets</pre>`],
          ['AI agent', `<pre>agent.invoke("studio03.colour",
    asset="pavilion_story_v3")
<span class="ok">→ pass · accent 11% · contrast 7.2:1</span></pre>`],
        ].map(([l, body], i) => `
          <li class="beat" data-step-on="${i}">
            <span class="beat__num">${String(i + 1).padStart(2, '0')}</span>
            <div class="beat__body"><span class="beat__label">${l}</span><div class="beat__text">${body}</div></div>
          </li>`).join('')}
      </ol>`,
    states: [0, 1, 2, 3, 4].map((st) => ({
      cam: st === 0
        ? { pos: c(0, 3.4, 13.6), tgt: c(0, 2.4, 0), fov: 38, shift: 0.17, lift: 3, drift: 0.12 }
        : { pos: c(0.6, 3.6 + (st > 2 ? 0.6 : 0), 13.2), tgt: c(0, 2.4 + (st > 2 ? 0.3 : 0), 0), fov: 38, shift: 0.17, drift: 0.12 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.5, recog: 1, book: 1, stage: { to: st, dur: st ? 2.6 : 1.6 }, dof: 26, grid: 0.3 },
      dur: st === 0 ? 3.2 : 2.6,
    })),
    hold: [6, 6, 6, 6, 6],
  },

  // ------------------------------------------------------------------ 06
  {
    id: 'skills', menu: 'Creative skills', chapter: '06',
    eyebrow: 'Chapter 06 · Skills',
    title: 'Creative Skills',
    support: 'A skill packages one part of a brand’s behaviour so that any agent can load it and act on it.',
    html: `
      <aside class="panel skillcard" data-from="0">
        <header class="panel__head"><span>Skill · studio03.colour</span><span>v2.4</span></header>
        <h3>Colour</h3>
        <dl class="attrs attrs--tight">
          <div><dt>Purpose</dt><dd>Keeps every layout inside the Studio 03 palette and contrast rules.</dd></div>
          <div><dt>Inputs</dt><dd>${chips(['layout', 'channel', 'region'])}</dd></div>
          <div><dt>Tokens</dt><dd class="sw sw--big"><i style="background:#22303a"></i><i style="background:#5f9cbc"></i><i style="background:#d39a6a"></i><i style="background:#eef1f0"></i><i style="background:#c9c2b6"></i></dd></div>
          <div><dt>Constraints</dt><dd>Accent coverage at most 15%. Text contrast at least 4.5:1.</dd></div>
          <div><dt>Checks</dt><dd>9 automated checks</dd></div>
          <div><dt>Examples</dt><dd>412 approved assets</dd></div>
          <div><dt>Owner</dt><dd>Studio 03 design director</dd></div>
        </dl>
      </aside>`,
    states: [{
      cam: { pos: c(0, 10.5, 13.5), tgt: c(0, -0.6, 0), fov: 40, shift: 0.17, lift: 2, drift: 0.15 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.5, recog: 1, skills: 1, ring: { to: 1, dur: 2.6 }, core: { to: 1, dur: 2, delay: 1 }, book: { to: 0, dur: 1.2 }, stage: 4, dof: 40, grid: 0.3 },
      lit: [1], dur: 2.8,
    }],
    hold: [7],
  },

  // ------------------------------------------------------------------ 06b
  {
    id: 'agents', menu: 'Agent orchestration', chapter: '06',
    eyebrow: 'Chapter 06 · Skills',
    title: 'Agent Orchestration',
    support: 'Agents load the skills of whichever studio they are working for, and every studio keeps its own set.',
    html: `
      <aside class="panel orch" data-from="0">
        <header class="panel__head"><span>Agent orchestration</span><span class="live"><i></i>Live</span></header>
        <table>
          <thead><tr><th>Agent</th><th>Skills invoked</th><th>This week</th></tr></thead>
          <tbody>
          ${AGENTS.map((a, i) => `<tr><td><b>${a.name}</b></td><td>${chips(a.skills.map((s) => SKILLS[s].name))}</td><td class="num">${['1,240', '3,912', '6,005', '11,157'][i]}</td></tr>`).join('')}
          </tbody>
        </table>
        <p class="note">54 skills across six studios. Each agent works inside one studio at a time.</p>
      </aside>`,
    labels: () => BRANDS.map((b, i) => ({ key: 'chamber:' + i, text: `${b.name} skills`, sub: '9 skills', color: b.c })),
    states: [{
      cam: { pos: [-16, 24, 94], tgt: [6, 5, 32], fov: 42, shift: 0.17, lift: 10, drift: 0.4 },
      world: { layout: 2, graph: 1, focus: 0.6, dim: 0.25, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 1, mini: { to: 1, dur: 2.6, delay: 0.6 }, travelers: 1, dof: 200, grid: 0.4 },
      lit: [], dur: 3.4,
    }],
    hold: [7],
  },

  // ------------------------------------------------------------------ statement
  {
    id: 's3', menu: 'Creative infrastructure', kind: 'statement',
    html: statement('Executable creative skills', 'become', '<em>generative creative infrastructure</em>'),
    states: [{
      cam: { pos: c(-4, 9, 24), tgt: c(0, 3, 0), fov: 42, lift: 6, drift: 0.3 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.6, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 1, mini: 1, travelers: 1, dof: 60, grid: 0.3 },
      dur: 3.6,
    }],
    hold: [5],
  },

  // ------------------------------------------------------------------ 07
  {
    id: 'request', menu: 'Creative request', chapter: '07',
    eyebrow: 'Chapter 07 · The creative agent',
    title: 'Creative Request',
    support: 'A user describes the creative they need, and the system resolves the brand, region, campaign and permissions behind it.',
    html: `
      <div class="panel studio" data-from="0">
        <header class="panel__head"><span>Generative studio</span><span>New request</span></header>
        <div class="who">
          <span class="avatar">RL</span>
          <div><b>Regional communications lead</b><span>Nordics · Approval level 2 of 3</span></div>
          <div class="perm">${chips(['Studio 03', 'Nordics', 'Social', 'OOH'])}</div>
        </div>
        <div class="select" data-from="1">
          ${[['Company', 'Design group'], ['Brand', 'Studio 03'], ['Region', 'Nordics'], ['Campaign', 'Pavilion launch'], ['Creative type', 'Launch visual'], ['Channel', 'Story · OOH 6-sheet']].map(([k, v], i) => `
            <div class="sel" style="--d:${(i * 0.28).toFixed(2)}s"><span>${k}</span><b>${v}</b></div>`).join('')}
        </div>
        <p class="brief-empty">Describe the creative you need.</p>
        <div class="brief" data-from="2">
          <span class="mono-label">Brief</span>
          <p>Launch visual for the Harbour Pavilion opening in the Nordics. Dusk, seen from the water, with the building on the lower third.</p>
          <span class="mono-label">Resolved</span>
          <p class="resolved">${chips(['Typography 2.1', 'Colour 2.4', 'Photography 2.3', 'Layout 2.4', 'Logo 2.1', 'Localisation 2.2', 'Campaign 2.3'])}</p>
          <p class="src">214 approved Harbour Pavilion renders, drawings and photographs loaded as references, with the design model.</p>
        </div>
      </div>`,
    states: [0, 1, 2].map((st) => ({
      cam: { pos: c(0.5, 7.2, 16.5), tgt: c(0, 1.6, 0), fov: 40, shift: 0.2, lift: 2, drift: 0.12 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.5, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 0, mini: 1, dof: 40, grid: 0.3 },
      lit: st === 2 ? [0, 1, 2, 3, 4, 7, 8] : [], dur: st === 0 ? 3 : 1.4,
    })),
    hold: [5, 5, 6],
  },

  // ------------------------------------------------------------------ 08
  {
    id: 'generate', menu: 'Generation', chapter: '08',
    eyebrow: 'Chapter 08 · Generate within the system',
    title: 'Generation',
    support: 'Each layer is produced by the skill that governs it, so the composition starts inside the brand.',
    html: `
      <aside class="panel genlog" data-from="0">
        <header class="panel__head"><span>Generation log · pavilion_story_v3</span><span class="live"><i></i>Building</span></header>
        <ol>
          ${[
            ['00.4', 'Photography', 'Dusk sky and water plate generated from 38 approved project photographs.'],
            ['01.0', 'Layout', 'Twelve-column grid set with the building on the lower third.'],
            ['01.5', 'Campaign', 'Pavilion rendered from the approved design model, verticals corrected.'],
            ['02.1', 'Typography', 'Headline set in Display 600 across two lines.'],
            ['02.6', 'Logo', 'Studio 03 arch mark placed with clear space of one arch height.'],
            ['03.0', 'Tone', 'Call to action written in the Studio 03 voice.'],
            ['03.4', 'Localisation', 'Swedish, Norwegian, Danish and Finnish variants queued.'],
          ].map(([t, s, d], i) => `<li style="--d:${(0.3 + i * 0.45).toFixed(2)}s"><span class="t">${t}</span><span class="s">${s}</span><p>${d}</p></li>`).join('')}
        </ol>
      </aside>`,
    states: [{
      cam: { pos: c(7.4, 6.4, 8.8), tgt: c(0.2, 4.3, 0.9), fov: 40, shift: -0.17, lift: 1, drift: 0.1 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.5, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 0, mini: 1, creative: { to: 1, dur: 0.6 }, build: { from: 0, to: 1, dur: 3.8, ease: 'lin' }, explode: 1, cgrid: 1, dof: 30, grid: 0.3 },
      lit: [0, 1, 2, 3, 4, 7, 8], dur: 2.6,
    }],
    hold: [8],
  },

  // ------------------------------------------------------------------ 09
  {
    id: 'govern', menu: 'Governance', chapter: '09',
    eyebrow: 'Chapter 09 · Governance',
    title: 'Governance',
    support: 'The draft is checked against every rule for its brand, region, campaign and channel before anyone reviews it.',
    html: `
      <aside class="panel checks" data-from="0">
        <header class="panel__head"><span>Brand governance · pavilion_story_v3</span><span>10 checks</span></header>
        <ol>
          ${[
            ['Brand rules', 'Within Studio 03 core principles.'],
            ['Typography', 'Display 600, two lines, minimum size met.'],
            ['Colour', 'Accent coverage 11%, contrast 7.2:1.'],
            ['Logo usage', 'Clear space and minimum width met.'],
            ['Composition', 'Building on the lower third.'],
            ['Photography', 'Natural light, verticals corrected, no staged people.'],
            ['Regional requirements', '<span class="was">Planning disclaimer missing.</span><span class="now">“Visualisation subject to planning consent” added by the Localisation skill.</span>'],
            ['Campaign rules', 'Opening date and project name match the launch plan.'],
            ['Channel requirements', 'Copy inside the story safe zone.'],
            ['Approval permissions', 'Story approved at level 2. OOH routed to the Studio 03 approver.'],
          ].map(([k, d], i) => `<li class="${i === 6 ? 'is-fix' : ''}" style="--d:${(0.55 + i * 0.51).toFixed(2)}s"><i class="tick"></i><div><b>${k}</b><p>${d}</p></div></li>`).join('')}
        </ol>
        <footer class="checks__sum"><span><b>9</b> passed</span><span><b>1</b> corrected</span><span><b>0</b> blocked</span></footer>
      </aside>`,
    states: [{
      cam: { pos: c(-1.2, 4.2, 12.6), tgt: c(0, 3.2, 0), fov: 38, shift: 0.19, drift: 0.08 },
      world: { layout: 2, graph: 1, focus: 1, dim: 0.5, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 0, mini: 1, creative: 1, build: 1, explode: { to: 0, dur: 1.6 }, safe: { to: 1, dur: 1, delay: 1 }, govern: { from: 0, to: 1, dur: 6, delay: 0.4, ease: 'lin' }, fix: { from: 0, to: 1, dur: 0.6, delay: 4.4 }, dof: 30, grid: 0.3 },
      lit: [4, 1, 7, 8], dur: 2.2,
    }],
    hold: [9],
  },

  // ------------------------------------------------------------------ 10
  {
    id: 'loop', menu: 'The loop', chapter: '10',
    eyebrow: 'Chapter 10 · The loop',
    title: 'The Loop',
    support: 'Approved creative is filed automatically and becomes reference material for the next request.',
    html: `
      <aside class="panel prov" data-from="0">
        <header class="panel__head"><span>Asset provenance</span><span>MAIS-S03-PAV-0412</span></header>
        <dl class="attrs attrs--tight">
          <div><dt>Filed in</dt><dd>Studio 03 / Pavilion launch / Nordics / Social</dd></div>
          <div><dt>Generated by</dt><dd>Campaign adaptation agent</dd></div>
          <div><dt>Requested by</dt><dd>Regional communications lead, Nordics</dd></div>
          <div><dt>Skills</dt><dd>${chips(['Colour 2.4', 'Typography 2.1', 'Layout 2.4', 'Logo 2.1', '+3'])}</dd></div>
          <div><dt>References</dt><dd>38 project photographs and the design model</dd></div>
          <div><dt>Checks</dt><dd>10 of 10, one corrected</dd></div>
          <div><dt>Approved</dt><dd>Level 2 · 8 October 2026</dd></div>
        </dl>
      </aside>
      <div class="loopring" data-from="0">
        <svg viewBox="0 0 360 360" aria-hidden="true">
          <circle cx="180" cy="180" r="128" class="lr-track"/>
          <circle cx="180" cy="180" r="128" class="lr-run"/>
          ${['Understand', 'Structure', 'Codify', 'Generate', 'Validate', 'Organise', 'Learn'].map((s, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            const x = 180 + Math.cos(a) * 128, y = 180 + Math.sin(a) * 128;
            const lx = 180 + Math.cos(a) * 160, ly = 180 + Math.sin(a) * 160;
            const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" class="lr-dot" style="--d:${(i * 0.35).toFixed(2)}s"/><text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="${anchor}" class="lr-text">${s.toUpperCase()}</text>`;
          }).join('')}
        </svg>
      </div>`,
    labels: () => [
      { key: 'loopcard', text: 'pavilion_story_v3', sub: 'Filed automatically', cls: 'is-path', delay: 3.2 },
      { key: 'region:0', text: 'Nordics', sub: 'Region', delay: 3.6 },
      { key: 'campaign:2:0', text: 'Pavilion launch', sub: 'Campaign', delay: 3.4 },
    ],
    states: [{
      cam: { pos: [26, 24, 84], tgt: [-2, 8, 36], fov: 40, shift: -0.12, lift: 6, drift: 0.3 },
      world: { layout: 2, graph: 1, focus: 0.5, dim: 0.15, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 1, mini: 1, creative: 1, build: 1, fix: 1, loop: { to: 1, dur: 3.4, delay: 0.4 }, links: { to: 1, dur: 3.2, delay: 3.4, ease: 'lin' }, dof: 120, grid: 0.35 },
      dur: 3,
    }],
    hold: [9],
  },

  // ------------------------------------------------------------------ 11
  {
    id: 'org', menu: 'Intelligent organisation', chapter: '11',
    eyebrow: 'Chapter 11 · The intelligent creative organisation',
    title: 'Intelligent Creative Organisation',
    support: 'Every studio, region and campaign now works from one shared understanding of the creative the group already owns.',
    html: `
      <div class="kpis" data-from="0">
        ${[['2.4M', 'assets indexed and related'], ['54', 'skills across six studios'], ['4', 'agent types at work'], ['10', 'checks on every output']].map(([v, l], i) => `<div class="kpi" style="--d:${(1.2 + i * 0.2).toFixed(2)}s"><b>${v}</b><span>${l}</span></div>`).join('')}
      </div>`,
    states: [{
      cam: { pos: [0, 64, 90], tgt: [0, -7, 8], fov: 42, lift: 12, orbit: 0.035, drift: 0.5 },
      world: { layout: { to: 3, dur: 5 }, graph: 1, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 1, mini: 1, travelers: 1, creative: 1, build: 1, fix: 1, loop: 1, links: 1, flow: { to: 1, dur: 2, delay: 2 }, dof: 300, grid: 0.5 },
      dur: 4.2,
    }],
    hold: [10],
  },

  // ------------------------------------------------------------------ close
  {
    id: 'close', menu: 'Summary', kind: 'close',
    html: `
      <div class="close">
        <p class="eyebrow">Marketing Assets Intelligence System</p>
        <h2 class="close__title">One system for the <em>whole creative estate</em></h2>
        <ol class="claims">
          ${[
            'It understands the entire creative ecosystem.',
            'It encodes each studio brand as executable skills.',
            'It gives AI agents the intelligence of each studio.',
            'It generates new creative at scale.',
            'It governs every output before approval.',
            'It keeps every asset organised and traceable.',
            'It learns from each asset the organisation adds.',
          ].map((s, i) => `<li style="--d:${(0.5 + i * 0.12).toFixed(2)}s"><span>${String(i + 1).padStart(2, '0')}</span>${s}</li>`).join('')}
        </ol>
      </div>`,
    states: [{
      cam: { pos: [0, 58, 112], tgt: [0, 2, 0], fov: 40, shift: 0.2, orbit: 0.025, drift: 0.5 },
      world: { layout: 3, graph: 1, recog: 1, skills: 1, ring: 1, core: 1, stage: 4, agents: 1, mini: 1, travelers: 1, creative: 1, build: 1, fix: 1, loop: 1, links: 1, flow: 1, dim: 0.2, dof: 300, grid: 0.45 },
      dur: 3.6,
    }],
    hold: [10],
  },
];
