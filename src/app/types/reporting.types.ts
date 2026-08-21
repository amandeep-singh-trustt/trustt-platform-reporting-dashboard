export type QueryStatus = 'unverified' | 'healthy' | 'needs-review' | 'slow';
export type QueryRole = 'report' | 'support';

export interface SqlQuery {
  id: string;
  name: string;
  description: string;
  daoClass: string;
  sqlIdentifier: string;
  status: QueryStatus;
  sqlPreview: string;
  explainPlan?: string;
  reviewReason?: string;
  dbObjectRefs?: string[];
  // Reports/Job tab only (gen-mock-data.js) — the actual report-producing query vs
  // batch-count/pagination plumbing riding alongside it under the same job. Absent on OLTP queries.
  queryRole?: QueryRole;
}

export type DbObjectKind = 'view' | 'table';

export interface DbObjectDefinition {
  name: string;
  kind: DbObjectKind;
  sourceFile: string | null;
  definition: string | null;
  explainPlan?: string;
}

export type ReportApproach = 'chunk' | 'cursor';

export interface ReportingJob {
  id: string;
  name: string;
  categoryId: string;
  queries: SqlQuery[];
  // Reports/Job tab only — Spring Batch step architecture, verified against source (gen-mock-data.js
  // JOB_APPROACH): 'chunk' = reader/processor/writer into a staging table + a tasklet dumps it to file;
  // 'cursor' = a single tasklet streams the query cursor straight to the output file. Absent on OLTP queries.
  approach?: ReportApproach | null;
}

export type CategoryId = 'eod-bod' | 'daytime' | 'on-demand' | 'bank-recon' | string;

export interface ReportingCategory {
  id: CategoryId;
  name: string;
  jobs: ReportingJob[];
}

export interface ReportingDataset {
  generatedAt: string;
  summary: {
    totalCategories: number;
    totalJobs: number;
    totalQueries: number;
  };
  categories: ReportingCategory[];
}

export interface QueryContext {
  query: SqlQuery;
  job: ReportingJob;
  category: ReportingCategory;
}

export interface OltpDaoGroup {
  id: string;
  name: string;
  daoClass: string;
  moduleId: string;
  queries: SqlQuery[];
}

export interface OltpModuleSummary {
  id: string;
  name: string;
  daoGroupCount: number;
  queryCount: number;
  explainedCount: number;
  needsReviewCount: number;
}

export interface OltpModule {
  generatedAt: string;
  module: { id: string; name: string };
  summary: OltpModuleSummary;
  daoGroups: OltpDaoGroup[];
}

export interface OltpIndex {
  generatedAt: string;
  modules: OltpModuleSummary[];
}
