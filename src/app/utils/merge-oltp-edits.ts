import type { EditsState } from '../services/edits.service';
import type { OltpDaoGroup, SqlQuery } from '../types/reporting.types';

type OltpEdits = Pick<EditsState, 'queryOverrides' | 'deletedQueryIds'>;

export function mergeOltpEdits(daoGroups: OltpDaoGroup[], edits: OltpEdits): OltpDaoGroup[] {
  const deleted = new Set(edits.deletedQueryIds);

  return daoGroups.map((group) => {
    const queries: SqlQuery[] = group.queries
      .filter((q) => !deleted.has(q.id))
      .map((q) => {
        const override = edits.queryOverrides[q.id];
        return override ? { ...q, ...override } : q;
      });
    return { ...group, queries };
  });
}
