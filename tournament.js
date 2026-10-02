/* Shared tournament data + logic for groups.html (public view) and admin.html (score entry).

   Scores live in a Google Sheet behind a Google Apps Script web app (see apps-script/scores.gs).
   SCORES_URL is that web app's /exec URL. Leave it empty to run on the scores written below only. */
const SCORES_URL = 'https://script.google.com/macros/s/AKfycbyyJT-UQyBhyQbj0Gk3BwKy7gyTQNvTQKj0iJXHxgKnLVEsqNBhk4ERmaCkLQqFYdrd/exec';

/* Every team plays the other three in its group once (6 games per group, 18 total);
   each round, every team plays exactly once. A `score: [home, away]` written here is
   only a fallback — scores from SCORES_URL replace it. */
const GROUPS = {
  A: ['Τρεις και ο κούκλος', 'Αντί Συναφήν', 'Greek Russian', 'Santa'],
  B: ['Τα πουλέν', 'Συναφήν', 'Midrange Union', 'AJG'],
  C: ['Rawdoggers', 'Κουφάλες', 'Άσχετοι BC', 'The Jokers'],
};

const MATCHES = [
  // Round 1
  { id: 1,  round: 1, group: 'A', home: 'Τρεις και ο κούκλος', away: 'Santa',          score: null },
  { id: 2,  round: 1, group: 'B', home: 'Τα πουλέν',          away: 'AJG',            score: null },
  { id: 3,  round: 1, group: 'C', home: 'Rawdoggers',         away: 'The Jokers',     score: null },
  { id: 4,  round: 1, group: 'A', home: 'Αντί Συναφήν',       away: 'Greek Russian',  score: null },
  { id: 5,  round: 1, group: 'B', home: 'Συναφήν',            away: 'Midrange Union', score: null },
  { id: 6,  round: 1, group: 'C', home: 'Κουφάλες',           away: 'Άσχετοι BC',     score: null },
  // Round 2
  { id: 7,  round: 2, group: 'A', home: 'Τρεις και ο κούκλος', away: 'Greek Russian',  score: null },
  { id: 8,  round: 2, group: 'B', home: 'Τα πουλέν',          away: 'Midrange Union', score: null },
  { id: 9,  round: 2, group: 'C', home: 'Rawdoggers',         away: 'Άσχετοι BC',     score: null },
  { id: 10, round: 2, group: 'A', home: 'Santa',              away: 'Αντί Συναφήν',   score: null },
  { id: 11, round: 2, group: 'B', home: 'AJG',                away: 'Συναφήν',        score: null },
  { id: 12, round: 2, group: 'C', home: 'The Jokers',         away: 'Κουφάλες',       score: null },
  // Round 3
  { id: 13, round: 3, group: 'A', home: 'Τρεις και ο κούκλος', away: 'Αντί Συναφήν',   score: null },
  { id: 14, round: 3, group: 'B', home: 'Τα πουλέν',          away: 'Συναφήν',        score: null },
  { id: 15, round: 3, group: 'C', home: 'Rawdoggers',         away: 'Κουφάλες',       score: null },
  { id: 16, round: 3, group: 'A', home: 'Greek Russian',      away: 'Santa',          score: null },
  { id: 17, round: 3, group: 'B', home: 'Midrange Union',     away: 'AJG',            score: null },
  { id: 18, round: 3, group: 'C', home: 'Άσχετοι BC',         away: 'The Jokers',     score: null },
];

// Knockout teams are derived from the group stage.
const KNOCKOUT = {
  QF1: { score: null }, QF2: { score: null }, QF3: { score: null }, QF4: { score: null },
  SF1: { score: null }, SF2: { score: null },
  F:   { score: null },
};

const KO_IDS = ['QF1', 'QF2', 'QF3', 'QF4', 'SF1', 'SF2', 'F'];
const KO_FEEDS = { SF1: ['QF1', 'QF2'], SF2: ['QF3', 'QF4'], F: ['SF1', 'SF2'] };

/* ── standings ── */
const played = m => Array.isArray(m.score) && m.score.length === 2;

const sortRows = rows => rows.sort((x, y) =>
  (y.w - x.w) || ((y.pf - y.pa) - (x.pf - x.pa)) || (y.pf - x.pf) || GROUPS[x.group].indexOf(x.team) - GROUPS[y.group].indexOf(y.team));

function table(group) {
  const rows = Object.fromEntries(GROUPS[group].map(t => [t, { team: t, group, p: 0, w: 0, l: 0, pf: 0, pa: 0 }]));
  for (const m of MATCHES) {
    if (m.group !== group || !played(m)) continue;
    const [hs, as] = m.score, h = rows[m.home], a = rows[m.away];
    h.p++; a.p++; h.pf += hs; h.pa += as; a.pf += as; a.pa += hs;
    if (hs > as) { h.w++; a.l++; } else if (as > hs) { a.w++; h.l++; }
  }
  return sortRows(Object.values(rows));
}

const groupsDone = () => MATCHES.every(played);

/* ── knockout ── */
function seeds() {
  const tables = Object.keys(GROUPS).map(table);
  const tier = i => sortRows(tables.map(t => t[i]));
  const thirds = tier(2);
  return { list: [...tier(0), ...tier(1), ...thirds.slice(0, 2)], thirds };
}

// QF: 1v8, 4v5, 2v7, 3v6 — reassign 6/7/8 if that would pit two teams from the same group against each other.
function quarterPairs(s) {
  const perms = [[5, 6, 7], [5, 7, 6], [6, 5, 7], [6, 7, 5], [7, 5, 6], [7, 6, 5]];
  const ok = p => s[2].group !== s[p[0]].group && s[1].group !== s[p[1]].group && s[0].group !== s[p[2]].group;
  const p = perms.find(ok) || perms[0];
  return { QF1: [0, p[2]], QF2: [3, 4], QF3: [1, p[1]], QF4: [2, p[0]] };
}

function winner(id, teams) {
  const sc = KNOCKOUT[id] && KNOCKOUT[id].score;
  if (!teams[0] || !teams[1] || !Array.isArray(sc) || sc[0] === sc[1]) return null;
  return sc[0] > sc[1] ? teams[0] : teams[1];
}

// Every knockout tie: its two teams (null until known) plus where each slot comes from —
// a seed index (0–7) for quarter-finals, the feeding tie id after that.
function knockout() {
  const done = groupsDone(), sd = seeds();
  const qf = done ? quarterPairs(sd.list) : { QF1: [0, 7], QF2: [3, 4], QF3: [1, 6], QF4: [2, 5] };
  const ties = {};
  for (const id of ['QF1', 'QF2', 'QF3', 'QF4']) {
    ties[id] = { seeds: qf[id], teams: qf[id].map(i => done ? sd.list[i].team : null) };
  }
  for (const id of ['SF1', 'SF2', 'F']) {
    ties[id] = { from: KO_FEEDS[id], teams: KO_FEEDS[id].map(f => winner(f, ties[f].teams)) };
  }
  return { ties, thirds: sd.thirds, done, champion: winner('F', ties.F.teams) };
}

/* ── remote scores ── */
const matchById = id => MATCHES.find(m => String(m.id) === String(id));

// scores: { "1": [21, 17], "QF1": [21, 9], ... } — ids missing from the map keep their fallback.
function applyScores(scores) {
  for (const [id, sc] of Object.entries(scores || {})) {
    const valid = Array.isArray(sc) && sc.length === 2 && sc.every(Number.isInteger);
    const target = matchById(id) || KNOCKOUT[id];
    if (target) target.score = valid ? sc : null;
  }
}

async function fetchScores() {
  if (!SCORES_URL) return null;
  const res = await fetch(SCORES_URL + '?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  applyScores(data.scores);
  return data;
}

// text/plain keeps this a "simple" CORS request, so Apps Script can answer without a preflight.
async function postScores(payload) {
  if (!SCORES_URL) throw new Error('SCORES_URL is not set in tournament.js');
  const res = await fetch(SCORES_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (data.scores) applyScores(data.scores);
  return data;
}

// Greek all-caps drops the tonos (ΌΜΙΛΟΙ → ΟΜΙΛΟΙ); CSS uppercase would keep it.
const caps = s => (s || '').toLocaleUpperCase('el').normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
