import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Sidebar } from './layout/sidebar/sidebar';
import { QueryDrawer } from './components/query-drawer/query-drawer';
import { ReportingDataService } from './services/reporting-data.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar, QueryDrawer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly data = inject(ReportingDataService);
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.apply();
    this.data.load().subscribe();
  }
}
