import { Component, input } from '@angular/core';

const PATHS: Record<string, string> = {
  'layout-dashboard': 'M3 3h7v9H3V3Zm11 0h7v5h-7V3ZM3 16h7v5H3v-5Zm11-3h7v8h-7v-8Z',
  sunrise: 'M12 2v4M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41M22 18H2a10 10 0 0 1 20 0Z',
  sun: 'M12 4V2M12 22v-2M4.93 4.93 3.51 3.51M20.49 20.49l-1.42-1.42M2 12H0M24 12h-2M4.93 19.07l-1.42 1.42M20.49 3.51l-1.42 1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  'mouse-pointer-click': 'm9 9 5 12 1.8-5.2L21 14Z M7.2 2.2 8 5.1 M5.1 8 2.2 7.2 M14 4.1 12 6 M6 12l-1.9.8',
  landmark: 'M3 22h18M6 18v-8M10 18v-8M14 18v-8M18 18v-8M3 10l9-6 9 6M3 10h18',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  search: 'm21 21-4.34-4.34M18.667 10.333A8.333 8.333 0 1 1 2 10.333a8.333 8.333 0 0 1 16.667 0Z',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  'chevron-left': 'm15 18-6-6 6-6',
  x: 'M18 6 6 18M6 6l12 12',
  database: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3ZM3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  gauge: 'm12 14 4-4M12 3a9 9 0 1 0 8.94 10H14a2 2 0 0 1-2-2Z',
  history: 'M3 3v5h5M3.05 13a9 9 0 1 0 2.13-5.36L3 8M12 7v5l4 2',
  'git-compare': 'M5 3v12M19 9v12M5 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM19 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8 6h7a3 3 0 0 1 3 3v0M16 18H9a3 3 0 0 1-3-3v0',
  lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.05V17h6v-.25c0-.85.4-1.55 1-2.05A7 7 0 0 0 12 2Z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3Z',
  'arrow-up-down': 'm21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16',
  loader: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z',
  copy: 'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  check: 'M20 6 9 17l-5-5',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
  plus: 'M12 5v14M5 12h14',
  pencil: 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z M15 5l4 4',
  move: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6h14Z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="class()"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input<number>(18);
  readonly strokeWidth = input<number>(2);
  readonly class = input<string>('');

  path(): string {
    return PATHS[this.name()] ?? PATHS['database'];
  }
}
