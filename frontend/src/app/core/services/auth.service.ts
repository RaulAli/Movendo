import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs'; // Import Subject
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models/auth.model';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

interface PendingAction {
  type: 'favorite' | 'unfavorite' | 'follow' | 'unfollow';
  slug?: string; // For favorite/unfavorite
  username?: string; // For follow/unfollow
  // Add other properties as needed for different actions
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
  public actionTriggered = new Subject<PendingAction>(); // New Subject

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  populate() {
    const token = this.jwtService.getToken();
    if (token) {
      console.log('Token encontrado:', token);
      this.apiService.get('/user', undefined, 3000).subscribe({
        next: (data) => {
          console.log('Datos del usuario:', data);
          this.setAuth({ ...data.user, token });
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          this.purgeAuth();
        }
      });
    } else {
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    console.log(user);
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl).then(() => {
      this.executePendingAction();
    });
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type: string, credentials: any): Observable<User> {
    const route = type === 'login' ? '/users/login' : '/users';

    console.log('🌐 Enviando a:', route);
    console.log('📦 Datos:', { user: credentials });

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
    console.log('📦 Datos de actualización:', { user: credentials });
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
    return this.apiService.post('/users/logout', {}, 3000).pipe(
      map(() => {
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
