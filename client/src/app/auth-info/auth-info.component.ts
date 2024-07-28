import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-info',
  standalone: true,
  imports: [],
  templateUrl: './auth-info.component.html',
  styleUrl: './auth-info.component.scss',
})
export class AuthInfoComponent {
  constructor(private router: Router) {}

  onSubmit(): void {
    this.router.navigate(['login']);
  }
}
