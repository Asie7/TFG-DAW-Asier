import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { CalendarsComponent } from './pages/calendars/calendars.component';
import { CalendarDetailComponent } from './pages/calendar-detail/calendar-detail.component';
import { PolicyPrivacyComponent } from './pages/policy-privacy/policy-privacy.component'; 
import { JoinCalendarComponent } from './pages/join-calendar/join-calendar.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },        // Página principal
  { path: 'register', component: RegisterComponent }, // /register
  { path: 'login', component: LoginComponent },      // /login
  { path: 'calendars', component: CalendarsComponent }, // mis calendarios
  { path: 'calendars/:id', component: CalendarDetailComponent }, // vista individual del calendario
  { path: 'policy-privacy', component: PolicyPrivacyComponent }, // política de privacidad
  { path: 'join/:inviteCode', component: JoinCalendarComponent }, // join
  { path: '**', redirectTo: '' }                     // Cualquier otra ruta → landing
];