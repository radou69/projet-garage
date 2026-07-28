import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-menu-component',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-component.component.html',
  styleUrl: './menu-component.component.css'
})
export class MenuComponentComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    public menuState: MenuStateService
  ) {}

  get username(): string {
    return this.authService.getUsername() ?? '';
  }

  get isPatron(): boolean {
    return this.authService.isPatron();
  }

  get initials(): string {
    const local = this.username.split('@')[0];
    const parts = local.split(/[._-]+/).filter(p => p.length > 0);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts[1]?.charAt(0) ?? '';
    return (first + second).toUpperCase();
  }

  close(): void {
    this.menuState.close();
  }

  logout(): void {
    this.authService.logout();
    this.menuState.close();
    this.router.navigate(['/login']);
  }
}
