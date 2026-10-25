
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:3200/api/subscriptions';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPlans(): Observable<any> {
    return this.http.get(`${this.apiUrl}/plans`, {
      headers: this.getHeaders()
    });
  }

  getMySubscription(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`, {
      headers: this.getHeaders()
    });
  }

  createOrder(planId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create-order`,
      { planId },
      { headers: this.getHeaders() }
    );
  }

  verifyPayment(orderId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verify/${encodeURIComponent(orderId)}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
