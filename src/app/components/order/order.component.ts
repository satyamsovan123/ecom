import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subscription, switchMap } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit, OnDestroy {
  products: any[] = [];
  coupons: any[] = [];
  cartItems: any[] = [];
  totalAmount = 0;
  currency = '';
  subscriptions: Subscription[] = [];
  appliedCoupon: any = null;

  constructor(
    private backendService: BackendService,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    const subscription = this.backendService
      .getProducts()
      .pipe(
        switchMap((response: any) => {
          this.products = response.data;
          return this.backendService.getCoupons();
        }),
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.coupons = response.data;
          this.sanitizeCoupons();
        },
        error: (error: any) => {
          console.error(error.error);
          if (error.error.statusCode === 401) {
            this.commonService.handleSignout();
          }
          if (error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = 'Failed.';
          }
          this.commonService.updateNotificationSubject(notification);
        },
      });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  addToCart(product: any) {
    if (this.cartItems.includes(product)) {
      return;
    }

    if (this.cartItems.length > 0) {
      this.cartItems = [];
    }

    this.currency = product.currency;
    this.cartItems.push(product);

    this.updateTotalAmount();
  }

  removeFromCart(cartItem: any) {
    this.cartItems = this.cartItems.filter((item) => item._id !== cartItem._id);
    this.updateTotalAmount();
  }

  applyCoupon(coupon: any) {
    if (this.appliedCoupon) {
      return;
    }

    this.appliedCoupon = coupon;
    coupon.isApplied = true;
    this.updateTotalAmount();
  }

  sanitizeCoupons() {
    this.coupons.forEach((coupon) => {
      coupon['isApplied'] = false;
    });
  }

  updateTotalAmount() {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    if (this.appliedCoupon) {
      this.totalAmount -= (this.appliedCoupon.percent / 100) * this.totalAmount;
    }
  }

  handlePlaceOrder() {
    const orderData = {
      productId: this.cartItems[0]._id,
      couponId: this.appliedCoupon ? this.appliedCoupon._id : null,
      quantity: 1,
    };

    if (!orderData.couponId) {
      delete orderData.couponId;
    }

    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    const subscription = this.backendService
      .order(orderData)
      .pipe(
        finalize(() => {
          this.commonService.updateLoaderSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.router.navigate(['/profile']);
        },
        error: (error: any) => {
          console.error(error.error);
          if (error.error.statusCode === 401) {
            this.commonService.handleSignout();
          }
          if (error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = 'Failed.';
          }
          this.commonService.updateNotificationSubject(notification);
        },
      });

    this.subscriptions.push(subscription);
  }
}
