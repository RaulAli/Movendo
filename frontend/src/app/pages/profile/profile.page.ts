import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'profile-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

    constructor(private router: Router) { }

    goToSettings(): void {
        this.router.navigate(['/settings']);
    }
}
