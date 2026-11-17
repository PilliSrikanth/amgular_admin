import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {

  api = ' https://desktop-7rujm19.tailb99dfe.ts.net/api/chat';

  constructor(private http: HttpClient) {}

  getMessages(userId: string, ownerId: string, hostelId: string) {
    return this.http.get(`${this.api}/${userId}/${ownerId}/${hostelId}`);
  }

  sendMessage(data: any) {
    return this.http.post(`${this.api}/send`, data);
  }

}
