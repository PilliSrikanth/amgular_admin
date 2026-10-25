
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  loginUser(): void {
    if (this.loading) {
      return;
    }

    if (!this.email || !this.password) {
      alert('Please enter email and password.');
      return;
    }

    const body = {
      email: this.email.trim().toLowerCase(),
      password: this.password
    };

    this.loading = true;

    this.loginService.login(body).subscribe({
      next: (res: any) => {
        console.log('LOGIN SUCCESS:', res);

        this.loading = false;

        // Check JWT token
        if (!res?.token) {
          alert('Login successful, but token is missing.');
          return;
        }

        // Save JWT token
        localStorage.setItem('token', res.token);

        // Owner login
        if (res.owner) {
          const owner = res.owner;
          const ownerId =
            owner._id || owner.id || owner.ownerId;

          if (!ownerId) {
            console.error('Owner ID missing:', owner);
            alert('Owner ID is missing in the login response.');
            return;
          }

          localStorage.setItem('ownerId', String(ownerId));
          localStorage.setItem('owner', JSON.stringify(owner));
          localStorage.setItem('role', 'owner');

          alert('Owner login successful!');

          // Navigate to owner subscription page
          this.router.navigate(['/subscription-plans']);
          return;
        }

        // Admin login
        if (res.admin) {
          localStorage.setItem('admin', JSON.stringify(res.admin));
          localStorage.setItem('role', 'admin');

          alert('Admin login successful!');

          // Change this to your actual admin dashboard route
          this.router.navigate(['/admin-dashboard']);
          return;
        }

        // Handle APIs that return the user directly
        if (res.user) {
          const user = res.user;
          const userId = user._id || user.id || user.userId;

          localStorage.setItem('user', JSON.stringify(user));

          if (userId) {
            localStorage.setItem('userId', String(userId));
          }

          const role = String(user.role || '').toLowerCase();
          localStorage.setItem('role', role);

          if (role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (role === 'owner') {
            this.router.navigate(['/subscription-plans']);
          } else {
            this.router.navigate(['/home']);
          }

          return;
        }

        console.error('Unexpected login response:', res);
        alert('Login response does not contain an owner, admin, or user.');
      },

      error: (err: any) => {
        this.loading = false;
        console.error('LOGIN FAILED:', err);

        alert(
          err?.error?.message ||
          'Login failed. Please check your email and password.'
        );
      }
    });
  }
}
