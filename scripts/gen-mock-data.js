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
  { key: 'eod-bod', name: 'EOD/BOD Reports', match: /\b(ALM|GL BALANCE|GL TRANSACTIONS|trial balance|Audit Monthly|End to End Tat|ED Base|CDD OTR|DPD Bucket|One Plus|Demand List|Group Level POS|SI OTR|Collection Efficiency)\b/i },
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

// "report" = the actual data-producing query; "support" = a pure batch-range sizing
// query (count/min/max used only to carve the job into chunks — never itself report output).
//
// Everything routed through a SqlPagingQueryProviderFactoryBean / "constructor(...)" /
// "*ByChunk" method is STILL a real report query — chunked pagination (SELECT * FROM
// <table/view> WHERE id BETWEEN ...) is how these reports fetch their rows, confirmed by
// reading the actual SQL for every such row in cleaned/reporting-reports.csv (e.g. APY Base
// NET Data's "constructor (querySelectClause/queryFromClause/queryWhereClause)" resolves to
// "SELECT * FROM apy_base_net_data_report WHERE id >= :minValue AND id <= :maxValue" — that
// IS the report). Do not add method-name patterns for these back in.
const SUPPORT_SQL_RE = /^\s*SELECT\s+COUNT\(/i;
// case-sensitive: camelCase methods always capitalize a standalone "Count" segment
// (batchGetCountFor..., getBatchCount..., getLoanAppCount) — a case-insensitive match would
// also hit "Account"/"Accounts" (contains "ccount"), which is not plumbing.
const SUPPORT_METHOD_COUNT_RE = /Count/;

// Second signal: a single-key point lookup (WHERE <id/ref/file column> = ?1 or = :name) that
// enriches ONE record already being assembled by a report in progress — not a report on its
// own. Confirmed by reading real examples: Enach Presentation Report Path's 15 "report" rows
// were ALL findXxxByAccountId/findXxxByAccNo-style single-account lookups; RBI ADF's
// findAllByRefNumber variants are alternate resend-by-batch-ref lookups duplicating the same
// entity's primary chunked extract. Equality only (not IN/BETWEEN/>=) — bulk range/list
// conditions on the same columns (e.g. "id BETWEEN :minValue AND :maxValue") stay 'report'.
const POINT_LOOKUP_COL_RE =
  /\b(account_id|loan_account_id|customer_id|cust_acc_no|account_number|loan_agreement_number|entity_id|ref_no|ref_number|report_ref_no|report_ref_number|report_code|inbound_file_name|outbound_file_name|file_category|file_type)\s*=\s*[?:]/i;

function queryRoleFor(sql, methodName) {
  const method = methodName || '';
  const query = sql || '';
  if (SUPPORT_SQL_RE.test(query)) return 'support';
  if (SUPPORT_METHOD_COUNT_RE.test(method)) return 'support';
  if (POINT_LOOKUP_COL_RE.test(query)) return 'support';
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
