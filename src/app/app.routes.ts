import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'category/:categoryId',
    loadComponent: () => import('./pages/category/category-page').then((m) => m.CategoryPage),
  },
  {
    path: 'category/:categoryId/job/:jobId',
    loadComponent: () => import('./pages/job-detail/job-detail-page').then((m) => m.JobDetailPage),
  },
  {
    path: 'oltp',
    loadComponent: () => import('./pages/oltp-dashboard/oltp-dashboard-page').then((m) => m.OltpDashboardPage),
  },
  {
    path: 'oltp/:moduleId',
    loadComponent: () => import('./pages/oltp-module/oltp-module-page').then((m) => m.OltpModulePage),
  },
  {
    path: 'oltp/:moduleId/:daoGroupId',
    loadComponent: () => import('./pages/oltp-group-detail/oltp-group-detail-page').then((m) => m.OltpGroupDetailPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings-page').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: '' },
];
