// Shared, fictional organisation model: a design group with six architecture studio brands.
// Studios are numbered rather than named.

export const BRANDS = [
  { id: 'S01', name: 'Studio 01', cat: 'Workplace', c: '#d08a5c', deep: '#2b1b13', cream: '#f3ece3', acc: '#8e9a9c', mark: 'stair' },
  { id: 'S02', name: 'Studio 02', cat: 'Hospitality', c: '#c9a45c', deep: '#2a2214', cream: '#f4eee2', acc: '#7c6a58', mark: 'circle' },
  { id: 'S03', name: 'Studio 03', cat: 'Cultural', c: '#5f9cbc', deep: '#0f2a38', cream: '#eef1f0', acc: '#d39a6a', mark: 'arch' },
  { id: 'S04', name: 'Studio 04', cat: 'Residential', c: '#8fa77a', deep: '#1e2619', cream: '#efefe6', acc: '#c9b48a', mark: 'slab' },
  { id: 'S05', name: 'Studio 05', cat: 'Civic', c: '#b9a99a', deep: '#25221e', cream: '#f2f0eb', acc: '#a8735a', mark: 'columns' },
  { id: 'S06', name: 'Studio 06', cat: 'Interiors', c: '#c98e9e', deep: '#2e1c21', cream: '#f6eeee', acc: '#8a8f7a', mark: 'frame' },
];

export const HERO_BRAND = 2;

export const REGIONS = [
  'Nordics', 'DACH', 'UK & Ireland', 'France & Benelux', 'Iberia', 'CEE', 'North America', 'Middle East', 'APAC',
];

export const STORAGE = [
  { label: 'Cloud drive', sub: 'EMEA', files: '412,880' },
  { label: 'DAM', sub: 'North America', files: '690,214' },
  { label: 'Local server', sub: 'APAC', files: '238,507' },
  { label: 'Project folders', sub: 'Middle East', files: '171,936' },
  { label: 'Competition archive', sub: 'Global', files: '96,412' },
  { label: 'Render and film library', sub: 'Visualisation team', files: '58,330' },
  { label: 'Brand books and monographs', sub: '6 studios', files: '4,918' },
  { label: 'Social archive', sub: '31 accounts', files: '702,151' },
];

export const TYPES = ['poster', 'social', 'slide', 'video', 'page', 'model', 'material', 'drawing', 'logo', 'photo'];

export const SKILLS = [
  { key: 'typography', name: 'Typography' },
  { key: 'color', name: 'Colour' },
  { key: 'photography', name: 'Photography' },
  { key: 'layout', name: 'Layout' },
  { key: 'logo', name: 'Logo' },
  { key: 'motion', name: 'Motion' },
  { key: 'tone', name: 'Tone' },
  { key: 'localization', name: 'Localisation' },
  { key: 'campaign', name: 'Campaign' },
];

export const AGENTS = [
  { name: 'Campaign adaptation', skills: [0, 1, 3, 8] },
  { name: 'Localisation', skills: [7, 6, 0] },
  { name: 'Channel resizing', skills: [3, 4, 2] },
  { name: 'Governance', skills: [4, 1, 7, 8] },
];

// deterministic random
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
