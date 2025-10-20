import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Profile } from '../models/profile.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    constructor(private apiService: ApiService) { }

    get(username: string): Observable<Profile> {
        return this.apiService.get(`/profile/${username}`)
            .pipe(map(data => data.profile));
    }

    follow(username: string): Observable<Profile> {
        return this.apiService.post(`/profile/${username}/follow`)
            .pipe(map(data => data.profile));
    }

    unfollow(username: string): Observable<Profile> {
        return this.apiService.delete(`/profile/${username}/follow`)
            .pipe(map(data => data.profile));
    }

    getFollowers(username: string): Observable<Profile[]> {
        return this.apiService.get(`/profile/${username}/followers`)
            .pipe(map(data => data.profiles));
    }

    getFollowing(username: string): Observable<Profile[]> {
        return this.apiService.get(`/profile/${username}/following`)
            .pipe(map(data => data.profiles));
    }

    getFavorites(username: string): Observable<any[]> {
        return this.apiService.get(`/profile/${username}/favorites`)
            .pipe(map(data => data.eventos));
    }

    getComments(username: string): Observable<any[]> {
        return this.apiService.get(`/profile/${username}/comments`)
            .pipe(map(data => data.comments));
    }


}