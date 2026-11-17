
import { Component, OnInit } from '@angular/core';
import { HostelService } from '../hostel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  hostels: any[] = [];
  filteredHostels: any[] = [];

  categories = ['Mens', "Women's", 'Room'];
  activeCategory = 'Mens';

  ownerId: string | null = null;
  loading = false;

  constructor(
    private hostelService: HostelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ownerId = localStorage.getItem('ownerId');

    if (!this.ownerId) {
      console.error('Owner ID not found. Please login again.');
      return;
    }

    this.loadHostels();
  }

  // Load ALL hostels belonging to logged-in owner
  loadHostels(): void {

    if (!this.ownerId) {
      return;
    }

    this.loading = true;

    this.hostelService.getHostelsByOwner(this.ownerId).subscribe({

      next: async (res: any) => {

        console.log('Hostel API response:', res);

        // API response format: { data: [...] }
        const hostelList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        console.log('All owner hostels:', hostelList);

        // DO NOT FILTER OUT PENDING OR EXPIRED HOSTELS
        const hostelsWithDetails = await Promise.all(
          hostelList.map(async (h: any) => {

            const vacancy = h.vacancy || {};

            const totalVacancyCount = Object.values(vacancy).reduce(
              (sum: number, value: any) =>
                sum + (Number(value) || 0),
              0
            );

            const totalFilled = Array.isArray(h.hostelUsers)
              ? h.hostelUsers.length
              : 0;

            let reviews: any[] = [];

            try {
              const reviewsRes: any = await this.hostelService
                .getReviewsByHostel(h._id)
                .toPromise();

              reviews = Array.isArray(reviewsRes?.data)
                ? reviewsRes.data
                : Array.isArray(reviewsRes)
                  ? reviewsRes
                  : [];

            } catch (error) {
              console.error('Review loading failed:', error);
            }

            const avgRating = reviews.length > 0
              ? (
                  reviews.reduce(
                    (sum: number, review: any) =>
                      sum + Number(review.rating || 0),
                    0
                  ) / reviews.length
                ).toFixed(1)
              : 0;

            return {
              ...h,
              totalFilled,
              totalVacancy: Math.max(
                0,
                totalVacancyCount - totalFilled
              ),
              avgRating,
              reviews
            };
          })
        );

        this.hostels = hostelsWithDetails;

        this.filterByCategory(this.activeCategory);

        console.log('Hostels displayed:', this.hostels);

        this.loading = false;
      },

      error: (err: any) => {
        console.error('Hostel loading error:', err);
        this.loading = false;
      }

    });
  }

  // Filter by category
  filterByCategory(category: string): void {

    this.activeCategory = category;

    const mapCategory: { [key: string]: string } = {
      'Mens': 'boys',
      "Women's": 'girls',
      'Room': 'room'
    };

    const dbType = mapCategory[category];

    if (dbType) {
      this.filteredHostels = this.hostels.filter(
        (h: any) =>
          String(h.type || '').toLowerCase() === dbType
      );
    } else {
      this.filteredHostels = [...this.hostels];
    }

  }

  // Navigate according to subscription status
  openHostel(hostel: any): void {

    const status = String(
      hostel.subscriptionStatus || ''
    ).toUpperCase();

    console.log('Selected hostel:', hostel);
    console.log('Subscription status:', status);

    if (status === 'ACTIVE' && hostel.isPublished === true) {

      // Active subscription: open hostel details
      this.router.navigate([
        '/hostel-page',
        hostel._id
      ]);

    } else {

      // Pending, expired or suspended: open payment page
      this.router.navigate(
        ['/subscription-plans'],
        {
          queryParams: {
            hostelId: hostel._id
          }
        }
      );

    }
  }

  // Create new hostel
  createHostel(): void {
    this.router.navigate(['/create-hostel']);
  }

  // Get subscription status label
  getStatusLabel(hostel: any): string {

    const status = String(
      hostel.subscriptionStatus || ''
    ).toUpperCase();

    switch (status) {
      case 'ACTIVE':
        return 'Active';

      case 'PENDING_PAYMENT':
        return 'Payment Pending';

      case 'EXPIRED':
        return 'Expired';

      case 'SUSPENDED':
        return 'Suspended';

      default:
        return 'Not Subscribed';
    }
  }

}
