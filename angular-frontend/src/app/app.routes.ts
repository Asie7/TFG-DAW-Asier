import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { CalendarsComponent } from './pages/calendars/calendars.component';
import { CalendarDetailComponent } from './pages/calendar-detail/calendar-detail.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },        // Página principal
  { path: 'register', component: RegisterComponent }, // /register
  { path: 'login', component: LoginComponent },      // /login
  { path: 'calendars', component: CalendarsComponent }, // /calendars
  { path: 'calendars/:id', component: CalendarDetailComponent }, // /calendars/:id
  { path: '**', redirectTo: '' }                     // Cualquier otra ruta → landing
];