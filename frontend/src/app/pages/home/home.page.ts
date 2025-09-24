import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../../shared/event-list/list.component';
@Component({
  selector: 'home-page',
  standalone: true,
  imports: [
    CommonModule, 
    ListComponent
  ],
  templateUrl: './home.page.html'
})
export class HomePage {

}
