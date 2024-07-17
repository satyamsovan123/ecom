import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnDestroy {
  subscriptions: Subscription[] = [];

  constructor(
    private commonService: CommonService,
    private backendService: BackendService,
    private router: Router
  ) {}

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  handleSignup() {
    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    const subscription = this.backendService
      .signup(this.signupForm.value)
      .pipe(
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.updateAuthenticationSubject(true);
          this.commonService.token = response.headers.get('Authorization');
          this.router.navigate(['/order']);
        },
        error: (error: any) => {
          console.error(error.error);
          if (error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = 'Failed!';
          }
        },
      });

    this.subscriptions.push(subscription);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
