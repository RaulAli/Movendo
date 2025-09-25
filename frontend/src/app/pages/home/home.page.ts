import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../../shared/event-list/list.component';
import { ListCategoryComponent } from '../../shared/category-list/listcategory.component';
@Component({
  selector: 'home-page',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent,
    ListCategoryComponent
  ],
  templateUrl: './home.page.html'
})
export class HomePage {

}
