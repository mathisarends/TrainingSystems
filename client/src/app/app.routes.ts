import { Routes } from '@angular/router';

import { ExercisesComponent } from './features/exercise-page/components/exercise/exercises.component';

import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RequestNewPasswordEmail } from './features/auth/request-new-password-email/request-new-password-email.component';
import { ProfileComponent2 } from './features/profile-2/profile.component';
import { TrainingLogsComponent } from './features/profile-2/training-logs/training-logs.component';
import { TrainingDayStatisticsComponent } from './features/training-plans/training-day-statistics/training-day-statistics.component';
import { TrainingPlansComponent } from './features/training-plans/training-plans/training-plans.component';
import { TrainingViewComponent } from './features/training-plans/training-view/training-view.component';
import { SessionViewComponent } from './features/training-session/session-view/session-view.component';
import { StatisticsComponent } from './features/usage-statistics/statistics.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/reset-password', component: RequestNewPasswordEmail },
  { path: 'user/reset/password/:token', component: ResetPasswordComponent },
  { path: 'usage', component: StatisticsComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: TrainingPlansComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'statistics/:planId',
    component: TrainingDayStatisticsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'profile', component: ProfileComponent2, canActivate: [AuthGuard] },
  {
    path: 'profile/exercises',
    component: ExercisesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/logs',
    component: TrainingLogsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'training/view',
    component: TrainingViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'session/view',
    component: SessionViewComponent,
    canActivate: [AuthGuard],
  },
];
