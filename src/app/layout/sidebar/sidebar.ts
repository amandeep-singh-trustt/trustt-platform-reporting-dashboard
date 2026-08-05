import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Icon } from '../../components/icon/icon';
import { LayoutService } from '../../services/layout.service';
import { OltpDataService } from '../../services/oltp-data.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const REPORTS_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
  { label: 'EOD/BOD Reports', path: '/category/eod-bod', icon: 'sunrise' },
  { label: 'Day Time Reports', path: '/category/daytime', icon: 'sun' },
  { label: 'On Demand Reports', path: '/category/on-demand', icon: 'mouse-pointer-click' },
  { label: 'Bank Requirement/Reconciliation', path: '/category/bank-recon', icon: 'landmark' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly oltp = inject(OltpDataService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly isOltp = computed(() => this.currentUrl().startsWith('/oltp'));

  readonly navItems = computed<NavItem[]>(() => {
    if (!this.isOltp()) return REPORTS_ITEMS;
    return [
      { label: 'Dashboard', path: '/oltp', icon: 'layout-dashboard' },
      ...this.oltp.modules().map((m): NavItem => ({ label: m.name, path: `/oltp/${m.id}`, icon: 'database' })),
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ];
  });
}
