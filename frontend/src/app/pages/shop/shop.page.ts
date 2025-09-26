import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../../shared/list-evento/list-evento.component';
@Component({
  selector: 'shop-page',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent
  ],
  templateUrl: './shop.page.html'
})
export class ShopPage {

}
