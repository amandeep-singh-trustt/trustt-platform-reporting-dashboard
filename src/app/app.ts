import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Sidebar } from './layout/sidebar/sidebar';
import { QueryDrawer } from './components/query-drawer/query-drawer';
import { AddJobModal } from './components/add-job-modal/add-job-modal';
import { AddQueryModal } from './components/add-query-modal/add-query-modal';
import { EditQueryModal } from './components/edit-query-modal/edit-query-modal';
import { MoveJobModal } from './components/move-job-modal/move-job-modal';
import { ReportingDataService } from './services/reporting-data.service';
import { DbObjectsService } from './services/db-objects.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar, QueryDrawer, AddJobModal, AddQueryModal, EditQueryModal, MoveJobModal],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly data = inject(ReportingDataService);
  private readonly dbObjects = inject(DbObjectsService);
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.apply();
    this.data.load().subscribe();
    this.dbObjects.load().subscribe();
  }
}
