
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = 'https://desktop-7rujm19.tailb99dfe.ts.net/api/subscriptions';

  constructor(private http: HttpClient) {}

  // Get owner authentication headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // Get available subscription plans
  getPlans(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/plans`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // Get subscription for a particular hostel
  getMySubscription(hostelId: string): Observable<any> {

    const params = new HttpParams()
      .set('hostelId', hostelId);

    return this.http.get(
      `${this.apiUrl}/my`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  // Create Cashfree payment order for a particular hostel
  createOrder(
    hostelId: string,
    planId: string
  ): Observable<any> {

    if (!hostelId) {
      throw new Error('Hostel ID is required.');
    }

    if (!planId) {
      throw new Error('Subscription Plan ID is required.');
    }

    const body = {
      hostelId: hostelId,
      planId: planId
    };

    return this.http.post(
      `${this.apiUrl}/create-order`,
      body,
      {
        headers: this.getHeaders()
      }
    );
  }

  // Verify Cashfree payment
  verifyPayment(orderId: string): Observable<any> {

    if (!orderId) {
      throw new Error('Payment Order ID is required.');
    }

    return this.http.post(
      `${this.apiUrl}/verify/${encodeURIComponent(orderId)}`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }
}
