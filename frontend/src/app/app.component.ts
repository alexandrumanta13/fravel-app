import { Component } from '@angular/core';

import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterModule],
})
export class AppComponent {
  constructor() {}
}
