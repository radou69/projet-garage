import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-dashboard-component',
  imports: [RouterLink],
  templateUrl: './dashboard-component.component.html',
  styleUrl: './dashboard-component.component.css'
})
export class DashboardComponentComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private menuState: MenuStateService
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }
}
