import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../../shared/carousel/carousel.component';
import { ListComponent } from '../../shared/list-evento/list-evento.component';
import { ListCategoryComponent } from '../../shared/list-category/list-category.component';
@Component({
  selector: 'home-page',
  standalone: true,
  imports: [
    CommonModule,
    CarouselComponent,
    ListComponent,
    ListCategoryComponent
  ],
  templateUrl: './home.page.html'
})
export class HomePage {

}
