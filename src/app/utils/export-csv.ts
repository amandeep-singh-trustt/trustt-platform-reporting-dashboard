function csvCell(value: string): string {
  return `"${(value ?? '').replace(/"/g, '""')}"`;
}

export interface QueryExportRow {
  group: string; // service/category name
  repo: string; // job / DAO class name
  queryName: string;
  sqlIdentifier: string;
  sql: string;
  status: string;
  explainPlan: string;
}

export function downloadQueriesCsv(filename: string, groupHeader: string, repoHeader: string, rows: QueryExportRow[]): void {
  const header = [groupHeader, repoHeader, 'Query Name', 'SQL Identifier', 'Status', 'SQL', 'Explain Plan'];
  const lines = [header.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(
      [row.group, row.repo, row.queryName, row.sqlIdentifier, row.status, row.sql, row.explainPlan]
        .map(csvCell)
        .join(','),
    );
  }
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
