import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomepageComponent],
  template: '<app-homepage></app-homepage>',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'QuanLyTuyenDung';
}
