import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/login/login.component';
import { RegisterComponent } from './register/register.component';

import { LandingComponent } from './Pages/landing/landing.component';
import { TrainingPlansComponent } from './Pages/training-plans/training-plans.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';
import { ProfileComponent } from './Pages/profile/profile.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'training', component: TrainingPlansComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'spinner', component: SpinnerComponent },
];
