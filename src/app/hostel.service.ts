
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HostelService {

  baseUrl = 'https://desktop-7rujm19.tailb99dfe.ts.net/api';

  constructor(private http: HttpClient) {}

  // Get owner authentication token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Owner token not found. Please login again.');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Get all hostels belonging to the logged-in owner
  getHostelsByOwner(ownerId: string): Observable<any> {
    if (!ownerId) {
      return throwError(() => new Error('Owner ID is required.'));
    }

    try {
      return this.http.get(
        `${this.baseUrl}/hostels/owner/${ownerId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error: any) {
      return throwError(() => error);
    }
  }

  // Create a new hostel
  createHostel(hostelData: FormData): Observable<any> {
    try {
      return this.http.post(
        `${this.baseUrl}/hostels/add`,
        hostelData,
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error: any) {
      return throwError(() => error);
    }
  }

  // Get hostel by ID
  getHostelById(hostelId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/hostels/${hostelId}`
    );
  }

  // Get reviews by hostel ID
  getReviewsByHostel(hostelId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/reviews/hostel/${hostelId}`
    );
  }
}
