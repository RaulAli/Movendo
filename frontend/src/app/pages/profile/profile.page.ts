import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { Profile } from '../../core/models/profile.model';
import { switchMap } from 'rxjs/operators';
import { UserService } from '../../core/services/auth.service';
import { SettingsComponent } from '../../shared/settings/settings.component';
import { UserListComponent } from '../../shared/list-user/list-user.component';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [CommonModule, SettingsComponent, UserListComponent],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
    profile!: Profile;
    isUser: boolean = false;
    currentView: 'profile' | 'settings' | 'followers' | 'following' = 'profile';
    listUsers: Profile[] = [];

    constructor(
        private route: ActivatedRoute,
        private profileService: ProfileService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap(params => {
                const username = params.get('username');
                if (username) {
                    return this.profileService.get(username);
                } else {
                    return this.userService.currentUser.pipe(
                        switchMap(user => {
                            return this.profileService.get(user.username);
                        })
                    );
                }
            })
        ).subscribe(profile => {
            this.profile = profile;
            this.userService.currentUser.subscribe(user => {
                this.isUser = user.username === this.profile.username;
            });
        });
    }

    onToggleFollowing() {
        if (this.profile.following) {
            this.profileService.unfollow(this.profile.username).subscribe(profile => this.profile = profile);
        } else {
            this.profileService.follow(this.profile.username).subscribe(profile => this.profile = profile);
        }
    }

    showSettings(): void {
        this.currentView = 'settings';
    }

    showProfile(): void {
        this.currentView = 'profile';
    }

    showFollowers(): void {
        this.profileService.getFollowers(this.profile.username).subscribe(users => {
            this.listUsers = users;
            this.currentView = 'followers';
        });
    }

    showFollowing(): void {
        this.profileService.getFollowing(this.profile.username).subscribe(users => {
            this.listUsers = users;
            this.currentView = 'following';
        });
    }

    closeList(): void {
        this.listUsers = [];
        this.currentView = 'profile';
    }
}