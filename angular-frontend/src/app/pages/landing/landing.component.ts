import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../../components/user-avatar/user.avatar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {

}