
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface AppNotification {
  _id: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  actionUrl?: string;
  createdAt?: string;
  recipientType?: string;
  userId?: string;
  ownerId?: string;
}

export interface NotificationResponse {
  success?: boolean;
  message?: string;
  notifications?: AppNotification[];
  data?: AppNotification[] | {
    notifications?: AppNotification[];
    unreadCount?: number;
  };
  unreadCount?: number;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = 'https://desktop-7rujm19.tailb99dfe.ts.net/api/notification';
  private socket?: Socket;

  private readonly newNotificationSubject =
    new Subject<AppNotification>();

  readonly newNotification$ =
    this.newNotificationSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      '';

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getNotifications(
    page: number = 1,
    limit: number = 20
  ): Observable<NotificationResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<NotificationResponse>(
      this.apiUrl,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  getUnreadCount(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${this.apiUrl}/unread-count`,
      { headers: this.getHeaders() }
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${encodeURIComponent(id)}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${encodeURIComponent(id)}`,
      { headers: this.getHeaders() }
    );
  }

  connectSocket(): void {
    if (this.socket?.connected) {
      return;
    }

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      '';

    this.socket = io('http://localhost:3200', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on(
      'notification:new',
      (notification: AppNotification) => {
        this.newNotificationSubject.next(notification);
      }
    );
  }

  disconnectSocket(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
