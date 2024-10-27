import { Routes } from '@angular/router';

import { ExercisesComponent } from './features/exercise-page/components/exercise/exercises.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent2 } from './features/profile-2/profile.component';
import { TrainingLogsComponent } from './features/profile-2/training-logs/training-logs.component';
import { TrainingPlanStatisticsComponent } from './features/training-plans/training-plan-statistics/training-plan-statistics.component';
import { TrainingPlansComponent } from './features/training-plans/training-plans/training-plans.component';
import { TrainingViewComponent } from './features/training-plans/training-view/training-view.component';
import { SessionViewComponent } from './features/training-session/session-view/session-view.component';
import { TrainingSesssionStatisticsComponent } from './features/training-session/training-session-statistics/training-session-statistics.component';
import { StatisticsComponent } from './features/usage-statistics/statistics.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

export const routes: Routes = [
  { path: 'getting-started', component: RegisterComponent },
  { path: 'profile/progression', component: StatisticsComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: TrainingPlansComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics/session/:sessionid',
    component: TrainingSesssionStatisticsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics',
    component: TrainingPlanStatisticsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'profile', component: ProfileComponent2, canActivate: [AuthGuard] },
  {
    path: 'profile/exercises',
    component: ExercisesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'logs',
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

  {
    path: 'spinner',
    component: SpinnerComponent,
  },
];
