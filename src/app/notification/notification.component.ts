
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AppNotification,
  NotificationService
} from '../notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  loading = false;
  errorMessage = '';
  filter: 'all' | 'unread' = 'all';

  private subscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.connectSocket();

    this.subscription =
      this.notificationService.newNotification$.subscribe(
        (item: AppNotification) => {
          // Do not show notifications for other roles.
          const role = localStorage.getItem('role')?.toLowerCase();

          if (
            role &&
            item.recipientType &&
            item.recipientType !== role
          ) {
            return;
          }

          if (!this.notifications.some(n => n._id === item._id)) {
            this.notifications = [item, ...this.notifications];

            if (!item.isRead) {
              this.unreadCount++;
            }
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get visibleNotifications(): AppNotification[] {
    return this.filter === 'unread'
      ? this.notifications.filter(item => !item.isRead)
      : this.notifications;
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.notificationService.getNotifications(1, 100).subscribe({
      next: (response: any) => {
        this.notifications = response?.notifications || [];

        this.unreadCount =
          typeof response?.unreadCount === 'number'
            ? response.unreadCount
            : this.notifications.filter(item => !item.isRead).length;

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Notification loading failed:', error);

        this.errorMessage =
          error?.status === 401
            ? 'Please log in again to view notifications.'
            : 'Unable to load notifications. Check the backend API.';

        this.loading = false;
      }
    });
  }

  setFilter(value: 'all' | 'unread'): void {
    this.filter = value;
  }

  markRead(item: AppNotification): void {
    this.openNotification(item);
  }

  openNotification(item: AppNotification): void {
    if (!item?._id) {
      return;
    }

    const navigate = (): void => {
      if (
        item.actionUrl &&
        item.actionUrl.startsWith('/') &&
        !item.actionUrl.startsWith('//')
      ) {
        this.router.navigateByUrl(item.actionUrl).catch(
          error => console.error('Navigation failed:', error)
        );
      }
    };

    if (item.isRead) {
      navigate();
      return;
    }

    this.notificationService.markAsRead(item._id).subscribe({
      next: () => {
        item.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        navigate();
      },
      error: (error: any) => {
        console.error('Mark as read failed:', error);
        this.errorMessage = 'Could not update notification status.';
      }
    });
  }

  markAllRead(): void {
    if (!this.unreadCount) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(item => ({
          ...item,
          isRead: true
        }));

        this.unreadCount = 0;
      },
      error: (error: any) => {
        console.error('Mark all as read failed:', error);
        this.errorMessage = 'Could not mark all notifications as read.';
      }
    });
  }

  deleteNotification(item: AppNotification): void {
    this.notificationService.deleteNotification(item._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          notification => notification._id !== item._id
        );

        this.unreadCount = this.notifications.filter(
          notification => !notification.isRead
        ).length;
      },
      error: (error: any) => {
        console.error('Delete notification failed:', error);
        this.errorMessage = 'Could not delete notification.';
      }
    });
  }

  trackById(index: number, item: AppNotification): string {
    return item._id || String(index);
  }
}