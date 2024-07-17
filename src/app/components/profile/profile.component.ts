import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription, switchMap } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnDestroy, OnInit {
  subscriptions: Subscription[] = [];
  profile: any = {};
  orders: any[] = [];

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
      .getProfile()
      .pipe(
        switchMap((response: any) => {
          this.profile = response.data;
          return this.backendService.getOrders();
        }),
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.orders = response.data;
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
          this.commonService.updateNotificationSubject(notification);
        },
      });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleRefund(order: any) {
    if (order.paymentStatus !== 'completed') {
      return;
    }

    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    const subscription = this.backendService
      .refund({ orderId: order._id })
      .pipe(
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.ngOnInit();
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
          this.commonService.updateNotificationSubject(notification);
        },
      });

    this.subscriptions.push(subscription);
  }
}
