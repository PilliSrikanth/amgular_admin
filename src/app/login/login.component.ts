
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  currentYear = new Date().getFullYear();

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  loginUser(): void {
    if (this.loading) return;

    if (!this.email.trim() || !this.password) {
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

        if (!res?.token) {
          this.loading = false;
          alert('Login successful, but token is missing.');
          return;
        }

        localStorage.setItem('token', res.token);
        localStorage.setItem('ownerToken', res.token);

        // OWNER LOGIN
        if (res.owner) {
          const owner = res.owner;
          const ownerId = owner._id || owner.id || owner.ownerId;

          if (!ownerId) {
            this.loading = false;
            console.error('Owner ID missing:', owner);
            alert('Owner ID is missing in the login response.');
            return;
          }

          localStorage.setItem('ownerId', String(ownerId));
          localStorage.setItem('owner', JSON.stringify(owner));
          localStorage.setItem('role', 'owner');

          this.loading = false;
          this.router.navigate(['/home']);
          return;
        }

        // ADMIN LOGIN
        if (res.admin) {
          localStorage.setItem('admin', JSON.stringify(res.admin));
          localStorage.setItem('role', 'admin');

          this.loading = false;
          this.router.navigate(['/admin-dashboard']);
          return;
        }

        // USER LOGIN
        if (res.user) {
          const user = res.user;
          const userId = user._id || user.id || user.userId;
          const role = String(user.role || '').toLowerCase();

          localStorage.setItem('user', JSON.stringify(user));

          if (userId) {
            localStorage.setItem('userId', String(userId));
          }

          localStorage.setItem('role', role);

          if (role === 'admin') {
            this.loading = false;
            this.router.navigate(['/admin-dashboard']);
          } else if (role === 'owner') {
            const ownerId = user._id || user.id || user.userId;

            if (ownerId) {
              localStorage.setItem('ownerId', String(ownerId));
              localStorage.setItem('owner', JSON.stringify(user));
            }

            this.loading = false;
            this.router.navigate(['/home']);
          } else {
            this.loading = false;
            this.router.navigate(['/home']);
          }

          return;
        }

        this.loading = false;
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
