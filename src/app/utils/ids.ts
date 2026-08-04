export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function makeJobId(categoryId: string, name: string): string {
  return `${categoryId}__${slugify(name)}-${Date.now().toString(36)}`;
}

export function makeQueryId(): string {
  return `q-manual-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}
