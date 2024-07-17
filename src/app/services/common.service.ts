import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  loaderSubject = new BehaviorSubject<boolean>(false);
  loaderSubject$ = this.loaderSubject.asObservable();

  authenticationSubject = new BehaviorSubject<boolean>(false);
  authenticationSubject$ = this.authenticationSubject.asObservable();

  daysRemainingSubject = new BehaviorSubject<number>(0);
  daysRemainingSubject$ = this.daysRemainingSubject.asObservable();

  notificationSubject = new BehaviorSubject<{}>({
    message: '',
  });
  notificationSubject$ = this.notificationSubject.asObservable();

  constructor(private router: Router) {}

  updateLoaderSubject(loaderState: boolean) {
    this.loaderSubject.next(loaderState);
  }

  updateNotificationSubject(notification: {}) {
    this.notificationSubject.next(notification);
    setTimeout(() => {
      this.notificationSubject.next({
        message: '',
      });
    }, 5000);
  }

  updateAuthenticationSubject(authenticationState: boolean) {
    this.authenticationSubject.next(authenticationState);
  }

  updateDaysRemainingSubject(daysRemaining: number) {
    this.daysRemainingSubject.next(daysRemaining);
  }

  handleSignout() {
    this.updateAuthenticationSubject(false);
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  set token(token: string) {
    localStorage.setItem('token', token);
  }

  get token(): string {
    return localStorage.getItem('token') ?? '';
  }

  checkSavedCredentials() {
    try {
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken) {
        this.token = localStorageToken;
        this.updateAuthenticationSubject(true);
      }
    } catch (error) {
      this.handleSignout();
    }
  }
}
