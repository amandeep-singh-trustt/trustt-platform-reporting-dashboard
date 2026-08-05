#!/usr/bin/env node
// ponytail: one-shot CSV->JSON generator for the OLTP modules, run manually when cleaned/*.csv
// or output/*-explain.csv change. Mirrors gen-mock-data.js but groups by DAO class instead of
// a report/job column (these CSVs don't have one — dao,method,sql only).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseCsv, loadExplainByIndex, loadReviewByKey } = require('./lib/pipeline-csv');

const PIPELINE_DIR = '/home/disk2/workspace/amandeep/oltp_queries/pipeline';
const DB_OBJECT_DEFS_PATH = path.join(PIPELINE_DIR, 'output', 'db-object-definitions.json');
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'oltp');

const MODULES = [
  { id: 'accounting', name: 'Accounting' },
  { id: 'actor', name: 'Actor' },
  { id: 'approval', name: 'Approval' },
  { id: 'authorization', name: 'Authorization' },
  { id: 'batch', name: 'Batch' },
  { id: 'bpmn', name: 'BPMN' },
  { id: 'bre', name: 'BRE' },
  { id: 'dms', name: 'DMS' },
  { id: 'gateway', name: 'Gateway' },
  { id: 'los', name: 'LOS' },
  { id: 'masterdata', name: 'Masterdata' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'payments', name: 'Payments' },
  { id: 'task', name: 'Task' },
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function shortHash(s) {
  return crypto.createHash('md5').update(s).digest('hex').slice(0, 6);
}

const dbObjectDefs = fs.existsSync(DB_OBJECT_DEFS_PATH) ? JSON.parse(fs.readFileSync(DB_OBJECT_DEFS_PATH, 'utf8')) : {};
const dbObjectNames = Object.keys(dbObjectDefs);

function dbObjectRefsIn(sql) {
  const lower = (sql || '').toLowerCase();
  return dbObjectNames.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(lower));
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const indexSummaries = [];

for (const mod of MODULES) {
  const csvPath = path.join(PIPELINE_DIR, 'cleaned', `${mod.id}.csv`);
  if (!fs.existsSync(csvPath)) {
    console.log(`skip ${mod.id}: no cleaned csv`);
    continue;
  }
  const explainPath = path.join(PIPELINE_DIR, 'output', `${mod.id}-explain.csv`);
  const reviewPath = path.join(PIPELINE_DIR, 'output', `${mod.id}-needs-review.csv`);
  const explainByIndex = loadExplainByIndex(explainPath);
  const reviewByKey = loadReviewByKey(reviewPath);

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).filter((r) => r.length >= 3 && r[0] && r[0] !== 'dao');

  const groupsById = new Map();
  let queryCounter = 0;
  let explainedCount = 0;
  let needsReviewCount = 0;

  for (const [dao, method, sql] of rows) {
    queryCounter++;

    const lastSegment = (dao || '').split('.').pop() || 'unknown';
    const groupId = `${slugify(lastSegment)}-${shortHash(dao || '')}`;
    if (!groupsById.has(groupId)) {
      groupsById.set(groupId, { id: groupId, name: lastSegment, daoClass: dao || '', moduleId: mod.id, queries: [] });
    }
    const group = groupsById.get(groupId);

    const methodName = (method || '').split('#').pop().trim();
    const explainPlan = explainByIndex.get(queryCounter) || null;
    const reviewReason = reviewByKey.get(`${dao}||${method}`) || null;
    const status = explainPlan ? 'healthy' : reviewReason ? 'needs-review' : 'unverified';
    if (explainPlan) explainedCount++;
    if (reviewReason) needsReviewCount++;

    const query = {
      id: `${mod.id}-q-${queryCounter}`,
      name: methodName || `Query ${group.queries.length + 1}`,
      description: dao ? `via ${lastSegment}` : '',
      daoClass: dao || '',
      sqlIdentifier: methodName,
      status,
      sqlPreview: (sql || '').trim(),
    };
    if (explainPlan) query.explainPlan = explainPlan;
    if (reviewReason) query.reviewReason = reviewReason;
    const dbObjectRefs = dbObjectRefsIn(sql);
    if (dbObjectRefs.length) query.dbObjectRefs = dbObjectRefs;

    group.queries.push(query);
  }

  const daoGroups = Array.from(groupsById.values()).sort((a, b) => a.name.localeCompare(b.name));

  const summary = {
    id: mod.id,
    name: mod.name,
    daoGroupCount: daoGroups.length,
    queryCount: queryCounter,
    explainedCount,
    needsReviewCount,
  };
  indexSummaries.push(summary);

  const moduleOut = {
    generatedAt: '2026-08-04T00:00:00Z',
    module: { id: mod.id, name: mod.name },
    summary,
    daoGroups,
  };

  fs.writeFileSync(path.join(OUT_DIR, `${mod.id}.json`), JSON.stringify(moduleOut, null, 2));
  console.log(
    `${mod.id}: ${daoGroups.length} dao groups, ${queryCounter} queries, ${explainedCount} explained, ${needsReviewCount} needs-review`,
  );
}

fs.writeFileSync(
  path.join(OUT_DIR, 'index.json'),
  JSON.stringify({ generatedAt: '2026-08-04T00:00:00Z', modules: indexSummaries }, null, 2),
);
console.log(`\nwrote ${OUT_DIR}/index.json (${indexSummaries.length} modules)`);
