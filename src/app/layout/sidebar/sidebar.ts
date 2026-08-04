import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../components/icon/icon';
import { LayoutService } from '../../services/layout.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly layout = inject(LayoutService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
    { label: 'EOD/BOD Reports', path: '/category/eod-bod', icon: 'sunrise' },
    { label: 'Day Time Reports', path: '/category/daytime', icon: 'sun' },
    { label: 'On Demand Reports', path: '/category/on-demand', icon: 'mouse-pointer-click' },
    { label: 'Bank Requirement/Reconciliation', path: '/category/bank-recon', icon: 'landmark' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];
}
