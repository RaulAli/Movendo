import { Component } from '@angular/core';
import { ListDashboardComponent } from '../../shared/list_dashboard/list-dashboard.component';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    ListDashboardComponent
  ],
  templateUrl: './admin_dashboard.component.html'
})
export class AdminDashboardComponent { }
