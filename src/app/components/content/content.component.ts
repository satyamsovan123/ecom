import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
})
export class ContentComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  isSubscribed: boolean = false;
  daysRemaining: number = 0;
  validityPeriodInDays: number = 0;

  constructor(
    private backendService: BackendService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    const subscription = this.backendService
      .getSubscriptionStatus()
      .pipe(
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          const currentSubscription = response.data[0];

          const subscriptionCreatedAt = new Date(
            currentSubscription.createdAt
          ).getTime();
          const validityPeriodInMilliseconds =
            currentSubscription.product.validityInDays * 24 * 60 * 60 * 1000;
          const differenceInMilliseconds =
            subscriptionCreatedAt +
            validityPeriodInMilliseconds -
            new Date().getTime();
          const daysRemaining = Math.round(
            differenceInMilliseconds / (24 * 60 * 60 * 1000)
          );
          this.daysRemaining = daysRemaining;
          this.validityPeriodInDays =
            currentSubscription.product.validityInDays;
          this.commonService.updateDaysRemainingSubject(daysRemaining);

          if (!currentSubscription) {
            this.isSubscribed = false;
            notification.message = 'Subscription expired!';
          } else {
            this.isSubscribed = true;
          }
        },
        error: (error: any) => {
          console.error(error.error);
          if (error.error.statusCode === 401) {
            this.commonService.handleSignout();
          }
          if (error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = 'Failed!';
          }
        },
      });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get subscriptionClass(): string {
    return this.isSubscribed ? 'subscribed' : 'not-subscribed';
  }

  get mainText(): string {
    return this.isSubscribed ? 'Enjoy!' : 'Subscribe';
  }

  get subText(): string {
    return this.isSubscribed ? '(for now)' : '';
  }

  get descriptionText(): string {
    const warningParody =
      'So, you ask, what will happen if you do not pay? Well, nothing. The logo you see above (that was most certainly not made DALL-E) will fade away and you will be left with your sad, old, boring life.';
    const daysText = this.daysRemaining > 1 ? 'days' : 'day';
    return this.isSubscribed
      ? `We will be coming soon for your money after ${this.daysRemaining} ${daysText}. Better be ready with your wallet! ${warningParody}`
      : 'Pay us and we can make your boring life a little less boring!';
  }

  getOpacity(): number {
    const maxOpacity = 1;
    const minOpacity = 0.1;
    const opacity = this.daysRemaining / this.validityPeriodInDays;
    return Math.max(minOpacity, Math.min(maxOpacity, opacity));
  }
}
