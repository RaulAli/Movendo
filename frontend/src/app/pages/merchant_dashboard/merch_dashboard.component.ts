import { Component } from '@angular/core';
import { ListDashboardComponentMerch } from '../../shared/list-dashboard_merchant/list-dashboard_merchant.component';

@Component({
  selector: 'app-merch-dashboard',
  standalone: true,
  imports: [ListDashboardComponentMerch],
  templateUrl: './merch_dashboard.component.html'
})
export class DashboardComponentMerch { }
