// ponytail: shared CSV/explain/review parsing for the pipeline generator scripts (gen-mock-data.js, gen-oltp-data.js).
const fs = require('fs');

function parseCsv(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// { "Query N" -> "Explain Plan" text }, keyed by the 1-based row position in the
// source cleaned/<module>.csv (both this and resolve_and_explain.py iterate the
// same DictReader-order rows, so index N maps 1:1).
function loadExplainByIndex(csvPath) {
  const map = new Map();
  if (!fs.existsSync(csvPath)) return map;
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).filter((r) => r.length >= 2);
  for (let i = 1; i < rows.length; i += 2) {
    const label = rows[i][0] || '';
    const m = /^Query (\d+)$/.exec(label);
    if (!m) continue;
    const planRow = rows[i + 1];
    if (!planRow || planRow[0] !== 'Explain Plan') continue;
    map.set(Number(m[1]), planRow[1]);
  }
  return map;
}

// { "dao||method" -> reason }, from the needs-review.csv (covers both unresolved-placeholder
// and EXPLAIN-failed rows — both land in the same file, see resolve_and_explain.py).
function loadReviewByKey(csvPath) {
  const map = new Map();
  if (!fs.existsSync(csvPath)) return map;
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).filter((r) => r.length >= 4);
  for (let i = 1; i < rows.length; i++) {
    const [dao, method, , reason] = rows[i];
    map.set(`${dao}||${method}`, reason);
  }
  return map;
}

module.exports = { parseCsv, loadExplainByIndex, loadReviewByKey };
