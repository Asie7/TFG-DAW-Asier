import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policy-privacy.component.html'
})
export class PolicyPrivacyComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}