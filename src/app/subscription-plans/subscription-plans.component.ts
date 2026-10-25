
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

declare const Cashfree: any;

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css']
})
export class SubscriptionPlansComponent implements OnInit {

  private apiUrl = 'http://localhost:3200/api/subscriptions';

  loading = false;
  isSubscribed = false;

  currentPlanName = 'No active plan';
  currentPlanMessage =
    'Choose a plan to activate your owner membership.';

  private planId = '';

  // Use sandbox while testing.
private cashfreeMode: 'sandbox' | 'production' = 'production';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadSubscription();

    const orderId =
      this.route.snapshot.queryParamMap.get('order_id');

    if (orderId) {
      this.verifyPayment(orderId);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadSubscription(): void {
    this.http.get<any>(
      `${this.apiUrl}/my`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const subscription =
          res?.subscription ||
          res?.data?.subscription;

        if (subscription?.status === 'active') {
          this.isSubscribed = true;

          this.currentPlanName =
            subscription.planId?.name ||
            subscription.plan?.name ||
            'Owner Monthly';

          this.currentPlanMessage = subscription.endDate
            ? `Valid until ${new Date(
                subscription.endDate
              ).toLocaleDateString()}`
            : 'Your subscription is active.';
        } else {
          this.isSubscribed = false;
          this.currentPlanName = 'No active plan';
          this.currentPlanMessage =
            'Choose a plan to activate your owner membership.';
        }

        this.planId =
          res?.plan?._id ||
          res?.plans?.[0]?._id ||
          '';
      },
      error: (error) => {
        console.error('Subscription loading failed:', error);
      }
    });
  }

  subscribe(): void {
    if (this.loading) {
      return;
    }

    if (!localStorage.getItem('token')) {
      alert('Please log in before subscribing.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.planId) {
      this.createOrder();
      return;
    }

    // Find the ₹1 plan from the backend.
    this.http.get<any>(
      `${this.apiUrl}/plans`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const plans =
          res?.plans ||
          res?.data?.plans ||
          res?.data ||
          [];

        const plan = Array.isArray(plans)
          ? plans.find((item: any) =>
              Number(item.price) === 1
            )
          : null;

        if (!plan?._id) {
          alert('The ₹1 subscription plan was not found.');
          return;
        }

        this.planId = plan._id;
        this.createOrder();
      },
      error: (error) => {
        console.error('Plan loading failed:', error);
        alert('Unable to load subscription plans.');
      }
    });
  }

  private createOrder(): void {
    this.loading = true;

    this.http.post<any>(
      `${this.apiUrl}/create-order`,
      { planId: this.planId },
      { headers: this.getHeaders() }
    ).subscribe({
      next: async (res) => {
        const sessionId =
          res?.paymentSessionId ||
          res?.payment_session_id ||
          res?.data?.paymentSessionId ||
          res?.data?.payment_session_id;

        if (!sessionId) {
          this.loading = false;
          console.error('Create order response:', res);
          alert('Payment session was not returned by the server.');
          return;
        }

        try {
          if (typeof Cashfree !== 'function') {
            throw new Error('Cashfree SDK is not loaded.');
          }

          const cashfree = Cashfree({
            mode: this.cashfreeMode
          });

          await cashfree.checkout({
            paymentSessionId: sessionId,
            redirectTarget: '_self'
          });
        } catch (error) {
          console.error('Cashfree checkout error:', error);
          alert('Unable to open payment checkout.');
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Order creation failed:', error);

        alert(
          error?.error?.message ||
          'Unable to create subscription payment.'
        );
      }
    });
  }

  private verifyPayment(orderId: string): void {
    this.loading = true;

    this.http.post<any>(
      `${this.apiUrl}/verify/${encodeURIComponent(orderId)}`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.loading = false;

        if (
          res?.success &&
          (
            res?.subscription?.status === 'active' ||
            res?.status === 'PAID'
          )
        ) {
          alert('Payment verified successfully!');
          this.loadSubscription();
        } else {
          alert(
            res?.message ||
            'Payment is not confirmed yet. Please check again.'
          );
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { order_id: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Payment verification failed:', error);

        alert(
          'Unable to verify payment. Check the payment status before trying again.'
        );
      }
    });
  }
}
