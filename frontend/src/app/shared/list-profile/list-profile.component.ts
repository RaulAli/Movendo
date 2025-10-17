import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/auth.service';

@Component({
  selector: 'list-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-profile.component.html',
  styleUrls: ['./list-profile.component.scss']
})
export class ListProfileComponent implements OnInit {

  currentUser: any = null;
  @Output() settingsClicked = new EventEmitter<void>();

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser)
  }

  goToSettings(): void {
    this.settingsClicked.emit();
  }

  logout(): void {
    console.log('Cerrando sesión...');
  }
}


