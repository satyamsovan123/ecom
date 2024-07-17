import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private httpClient: HttpClient) {}

  getProducts() {
    return this.httpClient.get(environment.backendUrl + '/products');
  }

  getCoupons() {
    return this.httpClient.get(environment.backendUrl + '/coupons');
  }

  signin(data: any) {
    return this.httpClient.post(environment.backendUrl + '/signin', data, {
      observe: 'response',
    });
  }

  signup(data: any) {
    return this.httpClient.post(environment.backendUrl + '/signup', data, {
      observe: 'response',
    });
  }

  getProfile() {
    return this.httpClient.get(environment.backendUrl + '/profile');
  }

  getOrders() {
    return this.httpClient.get(environment.backendUrl + '/orders');
  }

  getSubscriptionStatus() {
    return this.httpClient.get(environment.backendUrl + '/check-subscription');
  }

  refund(data: any) {
    return this.httpClient.patch(environment.backendUrl + '/refund', data);
  }

  order(data: any) {
    return this.httpClient.post(environment.backendUrl + '/order', data);
  }
}
