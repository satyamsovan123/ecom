import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subscription, switchMap } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
declare var Stripe: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit, OnDestroy {
  stripe: any;
  clientSecret: any;
  cardElement: any;
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
    this.cartItems = [];
    this.cartItems.push(product);
    this.updateTotalAmount();
  }

  removeFromCart(cartItem: any) {
    this.cartItems = this.cartItems.filter((item) => item._id !== cartItem._id);
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    // Update total amount with coupon
    this.totalAmount = this.cartItems.reduce(
      (total, item) => total + item.price,
      0
    );

    if (this.appliedCoupon) {
      this.totalAmount =
        this.totalAmount -
        (this.appliedCoupon.percent / 100) * this.totalAmount;
    }

    // Update currency
    this.currency = this.cartItems[0].currency;
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

  handlePlaceOrder() {
    if (this.clientSecret) {
      return;
    }

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
          // this.router.navigate(['/profile']);
          this.clientSecret = response.data.clientSecret;

          if (!this.clientSecret) {
            throw new Error('Failed.');
          }

          // Check if payment method is already created
          if (!this.stripe) {
            this.createPaymentMethod();
            this.mountPaymentMethod();
          }
        },
        error: (error: any) => {
          console.log('eeee', error);
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

  createPaymentMethod() {
    this.stripe = Stripe(environment.stripeKey);
    const elements = this.stripe.elements();
    const style = {};
    this.cardElement = elements.create('card', { style: style });
  }

  mountPaymentMethod() {
    this.cardElement.mount('#card-element');
  }

  async handlePayment() {
    this.commonService.updateLoaderSubject(true);
    const notification = {
      message: 'Successful!',
    };

    try {
      const paymentResult = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: { card: this.cardElement },
        }
      );

      if (paymentResult.error) {
        notification.message = paymentResult.error.message;
        this.commonService.updateNotificationSubject(notification);
        this.commonService.updateLoaderSubject(false);
        return;
      }
      if (paymentResult.paymentIntent.status === 'succeeded') {
        // Need to update the order status
        const updatedData: any = await this.backendService.confirmOrder({
          paymentInfo: paymentResult.paymentIntent.id,
        });

        window.open(updatedData.data.receipt, '_blank');
        window.location.href = '/profile';

        notification.message = 'Successful!';
        this.commonService.updateNotificationSubject(notification);
        this.commonService.updateLoaderSubject(false);
      }
    } catch (error) {
      console.error(error);
      notification.message = 'Failed.';
      this.commonService.updateNotificationSubject(notification);
      this.commonService.updateLoaderSubject(false);
    }
  }

  handleCancelPayment() {
    location.reload();
  }
}
