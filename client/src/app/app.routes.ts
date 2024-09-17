import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/auth/login/login.component';
import { RegisterComponent } from './Pages/auth/register/register.component';

import { ProfileComponent } from './Pages/profile/profile.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';

import { ExercisesComponent } from './features/exercise-page/components/exercise/exercises.component';

import { UsageStatisticsComponent } from './Pages/usage-statistics/usage-statistics.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

import { RequestNewPasswordEmail } from './Pages/auth/request-new-password-email/request-new-password-email.component';
import { ResetPasswordComponent } from './Pages/auth/reset-password/reset-password.component';

import { AuthGuard } from './core/guards/auth.guard';
import { GymTicketComponent } from './features/gym-ticket/gym-ticket.component';
import { TrainingPlansComponent } from './features/training-plans/training-plans/training-plans.component';
import { TrainingViewComponent } from './features/training-plans/training-view/training-view.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/reset-password', component: RequestNewPasswordEmail },
  { path: 'user/reset/password/:token', component: ResetPasswordComponent },
  { path: 'user/usage', component: UsageStatisticsComponent, canActivate: [AuthGuard] },
  { path: 'user/ticket', component: GymTicketComponent, canActivate: [AuthGuard] },
  { path: 'spinner', component: SpinnerComponent },
  {
    path: '',
    component: TrainingPlansComponent,
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
