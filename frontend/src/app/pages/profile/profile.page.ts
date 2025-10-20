import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { Profile } from '../../core/models/profile.model';
import { switchMap } from 'rxjs/operators';
import { UserService } from '../../core/services/auth.service';
import { SettingsComponent } from '../../shared/settings/settings.component';
import { UserListComponent } from '../../shared/list-user/list-user.component';
import { CardComponent } from '../../shared/card-evento/card-evento.component';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { Evento } from '../../core/models/evento.model';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [CommonModule, SettingsComponent, UserListComponent, CardComponent, CommentsComponent, PaginationComponent],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
    profile!: Profile;
    isUser: boolean = false;
    currentView: 'profile' | 'settings' | 'followers' | 'following' | 'favorites' | 'comments' = 'favorites';
    listUsers: Profile[] = [];
    showUserListModal: boolean = false;
    userListType: 'followers' | 'following' | null = null;
    favoriteEvents: Evento[] = [];
    paginatedFavoriteEvents: Evento[] = [];
    totalFavoriteEvents: number = 0;
    currentFavoritePage: number = 1;
    itemsPerPage: number = 4;
    comments: any[] = [];

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
            this.showFavorites();
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
        this.currentView = 'favorites';
        this.showFavorites();
    }

    showFollowers(): void {
        this.showUserListModal = true;
        this.userListType = 'followers';
        this.profileService.getFollowers(this.profile.username).subscribe(users => {
            this.listUsers = users;
        });
    }

    showFollowing(): void {
        this.showUserListModal = true;
        this.userListType = 'following';
        this.profileService.getFollowing(this.profile.username).subscribe(users => {
            this.listUsers = users;
        });
    }

    closeUserListModal(): void {
        this.showUserListModal = false;
        this.userListType = null;
        this.listUsers = [];
    }

    showFavorites(): void {
        this.currentView = 'favorites';
        this.profileService.getFavorites(this.profile.username).subscribe(events => {
            this.favoriteEvents = events;
            this.totalFavoriteEvents = events.length;
            this.paginateFavoriteEvents();
        });
    }

    showComments(): void {
        this.currentView = 'comments';
        this.profileService.getComments(this.profile.username).subscribe(comments => {
            this.comments = comments;
        });
    }

    paginateFavoriteEvents(): void {
        const startIndex = (this.currentFavoritePage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedFavoriteEvents = this.favoriteEvents.slice(startIndex, endIndex);
    }

    onFavoritePageChange(page: number): void {
        this.currentFavoritePage = page;
        this.paginateFavoriteEvents();
    }
}