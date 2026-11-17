
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    'Choose a plan to activate your hostel subscription.';

  // Hostel ID received from the URL
  hostelId = '';

  // Selected subscription plan
  planId = '';

  private verifyingPayment = false;

  // Must match the backend Cashfree environment
  private cashfreeMode: 'sandbox' | 'production' = 'sandbox';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // Read hostelId and order_id from URL
    this.hostelId =
      this.route.snapshot.queryParamMap.get('hostelId') || '';

    const orderId =
      this.route.snapshot.queryParamMap.get('order_id');

    if (!this.hostelId) {
      alert(
        'Hostel ID is missing. Please create or select a hostel first.'
      );

      this.router.navigate(['/owner-dashboard']);
      return;
    }

    // If Cashfree redirected back, verify payment
    if (orderId) {
      this.verifyPayment(orderId);
    } else {
      this.loadSubscription();
    }
  }

  // Authentication headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Load subscription for this particular hostel
  loadSubscription(): void {

    if (!this.hostelId) {
      return;
    }

    const params = new HttpParams()
      .set('hostelId', this.hostelId);

    this.http.get<any>(
      `${this.apiUrl}/my`,
      {
        headers: this.getHeaders(),
        params
      }
    ).subscribe({

      next: (res) => {

        const subscription =
          res?.subscription ||
          res?.data?.subscription;

        const status = String(
          subscription?.status || ''
        ).toUpperCase();

        const active =
          res?.active === true ||
          (
            status === 'ACTIVE' &&
            subscription?.endDate &&
            new Date(subscription.endDate).getTime() > Date.now()
          );

        this.isSubscribed = !!active;

        if (this.isSubscribed) {

          this.currentPlanName =
            subscription?.planId?.name ||
            subscription?.plan?.name ||
            'Owner Subscription';

          this.currentPlanMessage = subscription?.endDate
            ? `Valid until ${new Date(
                subscription.endDate
              ).toLocaleDateString()}`
            : 'Your subscription is active.';

          this.planId =
            subscription?.planId?._id ||
            subscription?.plan?._id ||
            '';

        } else {

          this.currentPlanName = 'No active plan';

          this.currentPlanMessage =
            'Choose a plan to activate your hostel subscription.';
        }
      },

      error: (error) => {
        console.error('Subscription loading failed:', error);

        if (error.status === 401) {
          alert('Your session has expired. Please log in again.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Optional method for selecting a plan from the HTML
  selectPlan(selectedPlanId: string): void {
    this.planId = selectedPlanId;
  }

  // Subscribe button
  subscribe(): void {

    if (this.loading) {
      return;
    }

    if (!localStorage.getItem('token')) {
      alert('Please log in before subscribing.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.hostelId) {
      alert('Hostel ID is missing.');
      return;
    }

    if (this.isSubscribed) {
      alert('This hostel already has an active subscription.');
      return;
    }

    // If a plan is already selected, create order
    if (this.planId) {
      this.createOrder();
      return;
    }

    // Otherwise load available plans
    this.loadPlansAndCreateOrder();
  }

  // Load plans and choose a default plan
  private loadPlansAndCreateOrder(): void {

    this.loading = true;

    this.http.get<any>(
      `${this.apiUrl}/plans`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      next: (res) => {

        const plans =
          res?.plans ||
          res?.data?.plans ||
          res?.data ||
          [];

        if (!Array.isArray(plans) || plans.length === 0) {
          this.loading = false;
          alert('No active subscription plans are available.');
          return;
        }

        // Preserve your previous ₹1 test-plan selection.
        // If it does not exist, use the first available plan.
        const selectedPlan =
          plans.find(
            (item: any) => Number(item.price) === 1
          ) || plans[0];

        if (!selectedPlan?._id) {
          this.loading = false;
          alert('Invalid subscription plan.');
          return;
        }

        this.planId = selectedPlan._id;

        this.createOrder();
      },

      error: (error) => {

        this.loading = false;

        console.error('Plan loading failed:', error);

        alert(
          error?.error?.message ||
          'Unable to load subscription plans.'
        );
      }
    });
  }

  // Create Cashfree order for the selected hostel and plan
  private createOrder(): void {

    if (!this.hostelId) {
      this.loading = false;
      alert('Hostel ID is required.');
      return;
    }

    if (!this.planId) {
      this.loading = false;
      alert('Please select a subscription plan.');
      return;
    }

    this.loading = true;

    // IMPORTANT: Send BOTH hostelId and planId
    const body = {
      hostelId: this.hostelId,
      planId: this.planId
    };

    console.log('Creating subscription order:', {
      hostelId: this.hostelId,
      planId: this.planId
    });

    this.http.post<any>(
      `${this.apiUrl}/create-order`,
      body,
      {
        headers: this.getHeaders()
      }
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

          alert(
            'Payment session was not returned by the server.'
          );

          return;
        }

        try {

          if (typeof Cashfree !== 'function') {
            throw new Error(
              'Cashfree SDK is not loaded. Check the script in index.html.'
            );
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

          alert('Unable to open Cashfree payment checkout.');

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

  // Verify payment after Cashfree redirects back
  private verifyPayment(orderId: string): void {

    if (this.verifyingPayment) {
      return;
    }

    if (!localStorage.getItem('token')) {
      alert('Please log in to verify your subscription payment.');
      this.router.navigate(['/login']);
      return;
    }

    this.verifyingPayment = true;
    this.loading = true;

    this.http.post<any>(
      `${this.apiUrl}/verify/${encodeURIComponent(orderId)}`,
      {},
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      next: (res) => {

        this.loading = false;
        this.verifyingPayment = false;

        const paymentStatus = String(
          res?.paymentStatus ||
          res?.payment?.status ||
          res?.status ||
          ''
        ).toUpperCase();

        const subscription =
          res?.subscription ||
          res?.data?.subscription;

        const subscriptionStatus = String(
          subscription?.status || ''
        ).toUpperCase();

        const subscriptionActive =
          subscriptionStatus === 'ACTIVE' &&
          (
            !subscription?.endDate ||
            new Date(subscription.endDate).getTime() > Date.now()
          );

        // Only accept payment confirmed by the backend
        const paymentReceived =
          res?.success === true &&
          paymentStatus === 'PAID' &&
          (
            subscriptionActive ||
            res?.active === true
          );

        if (paymentReceived) {

          alert(
            'Payment received and subscription activated successfully!'
          );

          // Navigate to home after successful verification
          this.router.navigate(['/home']);

          return;
        }

        const message =
          res?.message ||
          (
            paymentStatus === 'PENDING'
              ? 'Payment is still pending. Please check again.'
              : 'Payment was not confirmed or the subscription is not active.'
          );

        this.handlePaymentFailure(message);
      },

      error: (error) => {

        this.loading = false;
        this.verifyingPayment = false;

        console.error('Payment verification failed:', {
          orderId,
          hostelId: this.hostelId,
          status: error?.status,
          response: error?.error
        });

        this.handlePaymentFailure(
          error?.error?.message ||
          'Payment verification failed. Please check your payment status before retrying.'
        );
      }
    });
  }

  // Handle unsuccessful or pending payment
  private handlePaymentFailure(message: string): void {

    alert(message);

    // Return to subscription page while preserving hostelId
    this.router.navigate(
      ['/subscription-plans'],
      {
        queryParams: {
          hostelId: this.hostelId
        },
        replaceUrl: true
      }
    );
  }
}
