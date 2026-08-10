#!/usr/bin/env node
// ponytail: one-shot CSV->JSON generator, run manually when the source CSV or explain output changes. Not wired into build.
const fs = require('fs');
const path = require('path');
const { parseCsv, loadExplainByIndex, loadReviewByKey } = require('./lib/pipeline-csv');

const CSV_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/cleaned/reporting-reports.csv';
const EXPLAIN_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/output/reporting-reports-explain.csv';
const REVIEW_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/output/reporting-reports-needs-review.csv';
const DB_OBJECT_DEFS_PATH = '/home/disk2/workspace/amandeep/oltp_queries/pipeline/output/db-object-definitions.json';
const OUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'mock-data.json');
const DB_OBJECT_DEFS_OUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'db-object-definitions.json');

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

// "report" = the actual data-producing query; "support" = batch-range count /
// pagination-provider / chunk-fetch plumbing that rides alongside it under the same job.
const SUPPORT_SQL_RE = /^\s*SELECT\s+COUNT\(/i;
// case-sensitive: camelCase methods always capitalize a standalone "Count" segment
// (batchGetCountFor..., getBatchCount...) — a case-insensitive match would also hit
// "Account"/"Accounts" (contains "ccount"), which is not plumbing.
const SUPPORT_METHOD_COUNT_RE = /Count/;
const SUPPORT_METHOD_OTHER_RE = /SqlPagingQueryProviderFactoryBean|^constructor|ByChunk$|PagingQueryProvider/i;

function queryRoleFor(sql, methodName) {
  const method = methodName || '';
  if (SUPPORT_SQL_RE.test(sql || '')) return 'support';
  if (SUPPORT_METHOD_COUNT_RE.test(method)) return 'support';
  if (SUPPORT_METHOD_OTHER_RE.test(method)) return 'support';
  return 'report';
}

const explainByIndex = loadExplainByIndex(EXPLAIN_PATH);
const reviewByKey = loadReviewByKey(REVIEW_PATH);

const dbObjectDefs = fs.existsSync(DB_OBJECT_DEFS_PATH) ? JSON.parse(fs.readFileSync(DB_OBJECT_DEFS_PATH, 'utf8')) : {};
const dbObjectNames = Object.keys(dbObjectDefs);

function dbObjectRefsIn(sql) {
  const lower = (sql || '').toLowerCase();
  return dbObjectNames.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(lower));
}

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
    queryRole: queryRoleFor(sql, methodName),
  };
  if (explainPlan) query.explainPlan = explainPlan;
  if (reviewReason) query.reviewReason = reviewReason;
  const dbObjectRefs = dbObjectRefsIn(sql);
  if (dbObjectRefs.length) query.dbObjectRefs = dbObjectRefs;

  job.queries.push(query);
}

const categories = Array.from(categoriesByKey.values());
for (const cat of CATEGORY_RULES.concat([DEFAULT_CATEGORY])) {
  if (!categories.find((c) => c.id === cat.key)) categories.push({ id: cat.key, name: cat.name, jobs: [] });
}

const totalJobs = categories.reduce((n, c) => n + c.jobs.length, 0);
const totalQueries = categories.reduce((n, c) => n + c.jobs.reduce((m, j) => m + j.queries.length, 0), 0);
const explainedCount = explainByIndex.size;
const reportQueryCount = categories.reduce(
  (n, c) => n + c.jobs.reduce((m, j) => m + j.queries.filter((q) => q.queryRole === 'report').length, 0),
  0,
);

const output = {
  generatedAt: '2026-08-04T00:00:00Z',
  summary: { totalCategories: categories.length, totalJobs, totalQueries },
  categories,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
fs.writeFileSync(DB_OBJECT_DEFS_OUT_PATH, JSON.stringify(dbObjectDefs, null, 2));
console.log(
  `wrote ${OUT_PATH}: ${categories.length} categories, ${totalJobs} jobs, ${totalQueries} queries, ` +
    `${explainedCount} with explain plans, ${reviewByKey.size} needs-review, ${dbObjectNames.length} db object definitions, ` +
    `${reportQueryCount} report / ${totalQueries - reportQueryCount} support queries`,
);
