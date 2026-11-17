import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrl = "https://desktop-7rujm19.tailb99dfe.ts.net/api/owner/";
  apiUrl = "https://desktop-7rujm19.tailb99dfe.ts.net/api/";

  constructor(private http: HttpClient) { }

  register(data:any):Observable<any>{
    return this.http.post(this.baseUrl + "register", data);
  }

    login(data:any){
    return this.http.post(this.baseUrl + "login", data);
  }

  getMySubscription(): Observable<any> {
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}subscriptions/my`,
      { headers }
    );
  }
}