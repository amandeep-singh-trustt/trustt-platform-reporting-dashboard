#!/usr/bin/env node
// ponytail: one-shot CSV->JSON generator, run manually when the source CSV or explain output changes. Not wired into build.
const fs = require('fs');
const path = require('path');

const CSV_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/cleaned/reporting-reports.csv';
const EXPLAIN_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/output/reporting-reports-explain.csv';
const REVIEW_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/output/reporting-reports-needs-review.csv';
const OUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'mock-data.json');

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

const CATEGORY_RULES = [
  { key: 'eod-bod', name: 'EOD/BOD Reports', match: /\b(ALM|GL BALANCE|GL TRANSACTIONS|trial balance|Audit Monthly|End to End Tat)\b/i },
  { key: 'daytime', name: 'Day Time Reports', match: /\b(Credit Productivity|CIC|HHI|Login Base|Village Details|SO Base|SO PLP|State Vtc)\b/i },
  { key: 'bank-recon', name: 'Bank Requirement/Reconciliation', match: /\b(NEFT|Cheque Bounce|Posidex|Reconcil|SI Presentation|Enach|Rbi Adf|Sec NPA|SRS)\b/i },
];
const DEFAULT_CATEGORY = { key: 'on-demand', name: 'On Demand Reports' };

function categoryFor(jobName) {
  for (const rule of CATEGORY_RULES) if (rule.match.test(jobName)) return rule;
  return DEFAULT_CATEGORY;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// --- explain / needs-review lookups (optional — pipeline may not have run yet) ---

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

const explainByIndex = loadExplainByIndex(EXPLAIN_PATH);
const reviewByKey = loadReviewByKey(REVIEW_PATH);

const raw = fs.readFileSync(CSV_PATH, 'utf8');
const rows = parseCsv(raw).filter((r) => r.length >= 4 && r[0] && r[0] !== 'reports');

const categoriesByKey = new Map();
const jobsByName = new Map();
let queryCounter = 0;

for (const [jobNameRaw, dao, method, sql] of rows) {
  const jobName = jobNameRaw.split(';')[0].trim();
  const cat = categoryFor(jobName);
  if (!categoriesByKey.has(cat.key)) {
    categoriesByKey.set(cat.key, { id: cat.key, name: cat.name, jobs: [] });
  }
  const category = categoriesByKey.get(cat.key);

  const jobId = `${cat.key}__${slugify(jobName)}`;
  if (!jobsByName.has(jobId)) {
    const job = { id: jobId, name: jobName, categoryId: cat.key, queries: [] };
    jobsByName.set(jobId, job);
    category.jobs.push(job);
  }
  const job = jobsByName.get(jobId);

  const methodName = (method || '').split('#').pop().trim();
  queryCounter++;

  const explainPlan = explainByIndex.get(queryCounter) || null;
  const reviewReason = reviewByKey.get(`${dao}||${method}`) || null;
  const status = explainPlan ? 'healthy' : reviewReason ? 'needs-review' : 'unverified';

  const query = {
    id: `q-${queryCounter}`,
    name: methodName || `Query ${job.queries.length + 1}`,
    description: dao ? `via ${dao.split('.').pop()}` : '',
    daoClass: dao || '',
    sqlIdentifier: methodName,
    status,
    sqlPreview: (sql || '').trim(),
  };
  if (explainPlan) query.explainPlan = explainPlan;
  if (reviewReason) query.reviewReason = reviewReason;

  job.queries.push(query);
}

const categories = Array.from(categoriesByKey.values());
for (const cat of CATEGORY_RULES.concat([DEFAULT_CATEGORY])) {
  if (!categories.find((c) => c.id === cat.key)) categories.push({ id: cat.key, name: cat.name, jobs: [] });
}

const totalJobs = categories.reduce((n, c) => n + c.jobs.length, 0);
const totalQueries = categories.reduce((n, c) => n + c.jobs.reduce((m, j) => m + j.queries.length, 0), 0);
const explainedCount = explainByIndex.size;

const output = {
  generatedAt: '2026-08-04T00:00:00Z',
  summary: { totalCategories: categories.length, totalJobs, totalQueries },
  categories,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(
  `wrote ${OUT_PATH}: ${categories.length} categories, ${totalJobs} jobs, ${totalQueries} queries, ` +
    `${explainedCount} with explain plans, ${reviewByKey.size} needs-review`,
);
