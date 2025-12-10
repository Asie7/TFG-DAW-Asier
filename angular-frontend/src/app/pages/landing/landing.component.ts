import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../../components/user-avatar/user.avatar.component';
import { CookieConsentComponent } from '../../components/cookie-consent/cookie-consent.component';  

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent, CookieConsentComponent],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {

}