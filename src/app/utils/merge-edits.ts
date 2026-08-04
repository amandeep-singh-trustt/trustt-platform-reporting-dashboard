import type { EditsState } from '../services/edits.service';
import type { ReportingCategory, ReportingJob, SqlQuery } from '../types/reporting.types';

export function mergeEdits(baseCategories: ReportingCategory[], edits: EditsState): ReportingCategory[] {
  const categoryShells = new Map<string, ReportingCategory>();
  for (const c of baseCategories) categoryShells.set(c.id, { id: c.id, name: c.name, jobs: [] });

  const allJobs: ReportingJob[] = [];
  for (const c of baseCategories) {
    for (const job of c.jobs) {
      const queries: SqlQuery[] = job.queries.map((q) => {
        const override = edits.queryOverrides[q.id];
        return override ? { ...q, ...override } : q;
      });
      const extra = edits.newQueriesByJob[job.id];
      if (extra?.length) queries.push(...extra);

      const categoryId = edits.jobCategoryMoves[job.id] ?? job.categoryId;
      allJobs.push({ ...job, categoryId, queries });
    }
  }
  for (const job of edits.newJobs) {
    allJobs.push({ ...job, categoryId: edits.jobCategoryMoves[job.id] ?? job.categoryId });
  }

  for (const job of allJobs) {
    if (!categoryShells.has(job.categoryId)) {
      categoryShells.set(job.categoryId, { id: job.categoryId, name: job.categoryId, jobs: [] });
    }
    categoryShells.get(job.categoryId)!.jobs.push(job);
  }

  return Array.from(categoryShells.values());
}
