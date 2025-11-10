import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models/auth.model';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from './role.service';

interface PendingAction {
  type: 'favorite' | 'unfavorite' | 'follow' | 'unfollow' | 'comment';
  slug?: string;
  username?: string;
  body?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private pendingAction: PendingAction | null = null;

  public actionTriggered = new ReplaySubject<PendingAction>(1);

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService
  ) { }

  populate() {
    const token = this.jwtService.getToken();
    if (token) {
      const decodedToken = this.jwtService.getDecodedToken();
      if (decodedToken && !decodedToken.isAdmin) {
        this.apiService.get('/user', undefined, 3000).subscribe({
          next: (data) => {
            this.setAuth({ ...data.user, token });
          },
          error: (err) => {
            this.purgeAuth();
          }
        });
      }
    } else {
      this.purgeAuth();
    }
  }

  setAuth(user: User) {

    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.roleService.checkRole();
    this.executePendingAction();
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    window.localStorage.removeItem('accessToken');
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);
    this.roleService.checkRole();
  }

  attemptAuth(type: string, credentials: any): Observable<User> {
    const route = type === 'login' ? '/users/login' : '/users';

    return this.apiService.post(route, { user: credentials }, 3000).pipe(
      map((data: any) => {
        if (type === 'login') {
          this.setAuth(data.user);
        }
        return data;
      })
    );
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  getUserProfile(): Observable<User> {
    return this.apiService.get('/user/profile', undefined, 3000).pipe(
      map((data: any) => {
        return data.user;
      })
    );
  }

  update(credentials: any): Observable<User> {
    return this.apiService.put('/user', { user: credentials }, 3000).pipe(
      tap((data: any) => {
        if (data.user && data.user.token) {
          this.setAuth(data.user);
        } else if (data.user) {
          const currentUser = this.getCurrentUser();
          const updatedUser = { ...data.user, token: currentUser.token };
          this.currentUserSubject.next(updatedUser);
        }
      }),
      map((data: any) => data.user)
    );
  }

  logout(): Observable<void> {
    return this.apiService.get('/logout', undefined, 3000).pipe(
      tap(() => {
        this.purgeAuth();
      })
    );
  }

  applyForJob(jobId: string): Observable<any> {
    return this.apiService.post('/user/apply', { jobId: jobId }, 3000);
  }

  getUserById(userId: string): Observable<User> {
    return this.apiService.get(`/user/${userId}`, undefined, 3000).pipe(
      map((data: any) => {
        return data.user;
      })
    );
  }

  redirectToLoginWithAction(currentUrl: string, action: PendingAction): void {
    this.pendingAction = action;
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: currentUrl } });
  }

  private executePendingAction(): void {
    if (this.pendingAction) {
      this.actionTriggered.next(this.pendingAction);
      this.pendingAction = null;
    }
  }
}
