/**
 * Chalandri Basketball Cup — live scores backend.
 *
 * Lives in a Google Sheet (Extensions → Apps Script). groups.html reads scores with GET;
 * admin.html writes them with POST, guarded by the admin codes in Script Properties.
 *
 * Setup:
 *  1. New Google Sheet → Extensions → Apps Script → paste this file.
 *  2. Project Settings → Script Properties → add ADMIN_CODES, one or more `Name:code` pairs
 *     separated by commas, e.g.  Giorgos:kalathi-4821, Maria:triplo-9034
 *     The name shows next to each result in the sheet, so you can see who entered what.
 *  3. Run `setup` once from the editor (creates the Scores tab, asks for permission).
 *  4. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *  5. Put the /exec URL in SCORES_URL in tournament.js.
 *
 * Changing this code later: Deploy → Manage deployments → edit (pencil) → Version: New version.
 * That keeps the same URL; a brand-new deployment gets a new one.
 * Changing ADMIN_CODES takes effect immediately, no redeploy needed.
 *
 * The Scores tab can also be edited by hand as a fallback; the site picks it up within ~20s.
 */

const SHEET_NAME = 'Scores';
const HEADERS = ['id', 'home', 'away', 'updatedAt', 'updatedBy'];
const IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
  'QF1', 'QF2', 'QF3', 'QF4', 'SF1', 'SF2', 'F'];
const CACHE_KEY = 'scores';
const CACHE_SECONDS = 20;

function setup() {
  sheet_();
}

function doGet() {
  return json_({ ok: true, scores: readScores_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }

  const who = whoIs_(body.code);
  if (!who) {
    Utilities.sleep(1500); // slows down guessing
    return json_({ ok: false, error: 'bad_code' });
  }

  if (body.action === 'login') return json_({ ok: true, name: who, scores: readScores_() });

  if (body.action === 'save') {
    const id = String(body.id);
    if (IDS.indexOf(id) < 0) return json_({ ok: false, error: 'bad_id' });
    const score = body.score;
    if (score !== null) {
      const valid = Array.isArray(score) && score.length === 2 &&
        score.every(n => Number.isInteger(n) && n >= 0 && n <= 300);
      if (!valid) return json_({ ok: false, error: 'bad_score' });
      if (score[0] === score[1]) return json_({ ok: false, error: 'tie' });
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sh = sheet_();
      const row = IDS.indexOf(id) + 2;
      sh.getRange(row, 2, 1, 4).setValues([[
        score ? score[0] : '', score ? score[1] : '', new Date(), who,
      ]]);
      SpreadsheetApp.flush();
      CacheService.getScriptCache().remove(CACHE_KEY);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true, name: who, scores: readScores_() });
  }

  return json_({ ok: false, error: 'bad_action' });
}

/* ── helpers ── */

function whoIs_(code) {
  if (typeof code !== 'string' || !code.trim()) return null;
  const raw = PropertiesService.getScriptProperties().getProperty('ADMIN_CODES') || '';
  for (const entry of raw.split(/[,\n]/)) {
    const i = entry.lastIndexOf(':');
    if (i < 0) continue;
    const name = entry.slice(0, i).trim(), secret = entry.slice(i + 1).trim();
    if (secret && secret === code.trim()) return name || 'admin';
  }
  return null;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.getRange(2, 1, IDS.length, 1).setNumberFormat('@').setValues(IDS.map(id => [id]));
    sh.setFrozenRows(1);
  }
  return sh;
}

function readScores_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);

  const values = sheet_().getRange(2, 1, IDS.length, 3).getValues();
  const scores = {};
  for (const [id, home, away] of values) {
    const h = toScore_(home), a = toScore_(away);
    scores[String(id)] = h !== null && a !== null ? [h, a] : null;
  }
  cache.put(CACHE_KEY, JSON.stringify(scores), CACHE_SECONDS);
  return scores;
}

function toScore_(v) {
  if (v === '' || v === null) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
