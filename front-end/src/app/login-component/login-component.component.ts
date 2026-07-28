import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-login-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.css'
})
export class LoginComponentComponent {
  email = '';
  password = '';
  errorMessage = '';
  constructor(private authService: AuthService, private router: Router) {}
  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
