import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/auth/login/login.component';
import { RegisterComponent } from './Pages/auth/register/register.component';

import { TrainingPlansComponent } from './Pages/training-plans/training-plans.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';
import { ProfileComponent } from './Pages/profile/profile.component';

import { ExercisesComponent } from './Pages/exercises/exercises.component';
import { TrainingViewComponent } from './Pages/training-view/training-view.component';
import { AuthGuard } from './auth-guard.service';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: TrainingPlansComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'training/view',
    component: TrainingViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics/:planId',
    component: StatisticsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'exercises',
    component: ExercisesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'training/:planId/:week/:day',
    component: TrainingViewComponent,
    canActivate: [AuthGuard],
  },
];
