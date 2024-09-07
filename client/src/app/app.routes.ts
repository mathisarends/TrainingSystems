import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/auth/login/login.component';
import { RegisterComponent } from './Pages/auth/register/register.component';

import { TrainingPlansComponent } from './Pages/training-plans/training-plans.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';
import { ProfileComponent } from './Pages/profile/profile.component';

import { ExercisesComponent } from './Pages/exercises/exercises.component';
import { TrainingViewComponent } from './Pages/training-view/training-view.component';

import { UsageStatisticsComponent } from './usage-statistics/usage-statistics.component';
import { GymTicketComponent } from './gym-ticket/gym-ticket.component';
import { SpinnerComponent } from './components/loaders/spinner/spinner.component';

import { ResetPasswordComponent } from './Pages/auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/usage', component: UsageStatisticsComponent },
  { path: 'user/reset-password', component: ResetPasswordComponent },
  { path: 'user/ticket', component: GymTicketComponent },
  { path: 'spinner', component: SpinnerComponent },
  {
    path: '',
    component: TrainingPlansComponent,
  },
  {
    path: 'training/view',
    component: TrainingViewComponent,
  },
  {
    path: 'statistics/:planId',
    component: StatisticsComponent,
  },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'exercises',
    component: ExercisesComponent,
  },
  {
    path: 'training/:planId/:week/:day',
    component: TrainingViewComponent,
  },
];
