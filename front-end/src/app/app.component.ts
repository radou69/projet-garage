import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponentComponent } from './menu-component/menu-component.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-end';
}
