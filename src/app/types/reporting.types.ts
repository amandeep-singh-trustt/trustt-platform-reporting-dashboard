export type QueryStatus = 'unverified' | 'healthy' | 'needs-review' | 'slow';

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
}

export type DbObjectKind = 'view' | 'table';

export interface DbObjectDefinition {
  name: string;
  kind: DbObjectKind;
  sourceFile: string | null;
  definition: string | null;
  explainPlan?: string;
}

export interface ReportingJob {
  id: string;
  name: string;
  categoryId: string;
  queries: SqlQuery[];
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
