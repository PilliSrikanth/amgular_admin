import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private baseUrl = ' http://localhost:3200/api/requests';

  constructor(private http: HttpClient) {}

searchUsers(search: string) {
  return this.http.get(`${this.baseUrl}/searchusers?query=${search}`);
}


  addUserToHostel(payload: any) {
    return this.http.post(`${this.baseUrl}/send`, payload);
  }

  // 🔹 Get all requests for a user
  getOwnerRequests(ownerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/owner/${ownerId}`); 
  }

  // 🔹 Update request status (Accept / Decline)
  updateStatus(requestId: string, status: 'accepted' | 'declined'): Observable<any> {
    return this.http.put(`${this.baseUrl}/${requestId}/status`, { status });
  }

  
}
