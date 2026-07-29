import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuComponentComponent } from './menu-component/menu-component.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-end';

  constructor(private router: Router) {}

  isAuthRoute(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/inscription';
  }
}