export function applyOrder<T>(items: T[], getId: (item: T) => string, order: string[] | undefined): T[] {
  if (!order?.length) return items;
  const byId = new Map(items.map((item) => [getId(item), item]));
  const ordered: T[] = [];
  for (const id of order) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  // anything not in the stored order (newly added items) goes at the end, original order preserved
  for (const item of items) {
    if (byId.has(getId(item))) ordered.push(item);
  }
  return ordered;
}

export function reorderIds(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
