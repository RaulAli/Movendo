import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListComponent } from '../../shared/list-evento/list-evento.component';

@Component({
  selector: 'shop-page',
  standalone: true,
  imports: [CommonModule, ListComponent],
  templateUrl: './shop.page.html'
})
export class ShopPage implements OnInit {
  private route = inject(ActivatedRoute);
  slugCategory: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slugCategory = params.get('slug');
    });
  }
}
