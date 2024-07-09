import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/login/login.component';
import { LandingComponent } from './Pages/landing/landing.component';
import { TrainingPlansComponent } from './Pages/training-plans/training-plans.component';
import { VolumeCalculatorComponent } from './Pages/volume-calculator/volume-calculator.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';
import { ProfileComponent } from './Pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'training', component: TrainingPlansComponent },
  { path: 'volume', component: VolumeCalculatorComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'profile', component: ProfileComponent },
];
