import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListProfileComponent } from '../../shared/list-profile/list-profile.component';
import { SettingsComponent } from '../../shared/settings/settings.component';
@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [CommonModule, ListProfileComponent, SettingsComponent],
    template: `
    <list-profile 
      *ngIf="currentView === 'profile'" 
      (settingsClicked)="showSettings()">
    </list-profile>
    
    <settings-component 
      *ngIf="currentView === 'settings'" 
      (backToProfile)="showProfile()">
    </settings-component>
  `
})
export class ProfilePage {
    currentView: 'profile' | 'settings' = 'profile';

    showSettings(): void {
        this.currentView = 'settings';
    }

    showProfile(): void {
        this.currentView = 'profile';
    }
}