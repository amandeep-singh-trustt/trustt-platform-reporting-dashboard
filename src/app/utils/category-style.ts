export interface CategoryStyle {
  icon: string;
  badge: string;
  bar: string;
  text: string;
}

const STYLES: Record<string, CategoryStyle> = {
  'eod-bod': {
    icon: 'sunrise',
    badge: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    bar: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  daytime: {
    icon: 'sun',
    badge: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  'on-demand': {
    icon: 'mouse-pointer-click',
    badge: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
  },
  'bank-recon': {
    icon: 'landmark',
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: 'database',
  badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  bar: 'bg-slate-400',
  text: 'text-slate-600 dark:text-slate-400',
};

export function categoryStyle(categoryId: string): CategoryStyle {
  return STYLES[categoryId] ?? DEFAULT_STYLE;
}
