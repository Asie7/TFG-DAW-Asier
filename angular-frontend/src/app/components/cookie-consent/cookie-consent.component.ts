import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-consent.component.html',
})
export class CookieConsentComponent {

  isVisible = true;

  acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    this.isVisible = false;
  }

   rejectCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    this.isVisible = false;
  }

  ngOnInit() {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (accepted === 'true') {
      this.isVisible = false;
    }
  }

}
