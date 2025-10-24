import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { UserService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'list-user',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './list-user.component.html',
    styleUrls: ['./list-user.component.scss']
})
export class UserListComponent {
    @Input() users: Profile[] = [];
    @Input() listType: 'followers' | 'following' | null = null;
    @Output() closeList = new EventEmitter<void>();
    @Output() followChange = new EventEmitter<void>();

    currentUsername: string | undefined;

    constructor(
        private profileService: ProfileService,
        private userService: UserService,
        private router: Router
    ) {
        this.userService.currentUser.subscribe(user => {
            this.currentUsername = user?.username;
        });
    }

    onToggleFollowing(user: Profile) {
        if (user.username === this.currentUsername) {
            console.log('You cannot follow your own account.');
            return;
        }

        if (!this.currentUsername) {
            this.userService.redirectToLoginWithAction(this.router.url, {
                type: user.following ? 'unfollow' : 'follow',
                username: user.username
            });
            return;
        }

        if (user.following) {
            this.profileService.unfollow(user.username).subscribe(profile => {
                // Update the user in the list
                const index = this.users.findIndex(u => u.username === profile.username);
                if (index !== -1) {
                    this.users[index] = profile;
                    this.followChange.emit();
                }
            });
        } else {
            this.profileService.follow(user.username).subscribe(profile => {
                // Update the user in the list
                const index = this.users.findIndex(u => u.username === profile.username);
                if (index !== -1) {
                    this.users[index] = profile;
                    this.followChange.emit();
                }
            });
        }
    }

    onClose(): void {
        this.closeList.emit();
    }
}