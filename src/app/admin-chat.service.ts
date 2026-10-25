
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminChatService {
  private apiUrl = 'http://localhost:3200/api/admin-chat';
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3200', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Admin chat socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Admin chat socket error:', error.message);
    });
  }

  // Join the admin/owner chat room
  joinAdmin(adminId: string): void {
    if (!adminId) {
      console.error('Cannot join admin chat: adminId is missing');
      return;
    }

    this.socket.emit('admin-chat:join-admin', adminId);
  }

  // Join the user's chat room
  joinUser(userId: string): void {
    if (!userId) {
      console.error('Cannot join user chat: userId is missing');
      return;
    }

    this.socket.emit('admin-chat:join-user', userId);
  }

  // Save message using the backend HTTP API
  sendMessage(data: {
    userId: string;
    adminId: string;
    senderType: 'user' | 'admin';
    message: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/send`,
      data
    );
  }

  // Listen for real-time messages from the backend
  onMessage(): Observable<any> {
    return fromEvent<any>(this.socket, 'admin-chat:message');
  }

  // Listen for chat errors
  onError(): Observable<any> {
    return fromEvent<any>(this.socket, 'admin-chat:error');
  }

  // Load conversation between a user and owner/admin
  getConversation(
    userId: string,
    adminId: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/conversation/${userId}/${adminId}`
    );
  }

  // Load all conversations for the owner/admin
  getAdminConversations(adminId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/${adminId}`
    );
  }

  // Mark messages as read
  markAsRead(
    userId: string,
    adminId: string,
    readerType: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/read`,
      {
        userId,
        adminId,
        readerType
      }
    );
  }

  // Get unread message count
  getUnreadCount(
    userId: string,
    adminId: string,
    readerType: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/unread/${userId}/${adminId}/${readerType}`
    );
  }

  // Disconnect socket when no longer needed
  disconnect(): void {
    this.socket.disconnect();
  }
}
