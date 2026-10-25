import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {

  api = ' http://localhost:3200/api/chat';

  constructor(private http: HttpClient) {}

  getMessages(userId: string, ownerId: string, hostelId: string) {
    return this.http.get(`${this.api}/${userId}/${ownerId}/${hostelId}`);
  }

  sendMessage(data: any) {
    return this.http.post(`${this.api}/send`, data);
  }

}
