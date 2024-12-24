import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { GettingStartedComponent } from './features/auth/getting-started/getting-started.component';
import { BestPerformanceComponent } from './features/best-performance/best-performance.component';
import { ExercisesComponent } from './features/exercise-page/components/exercise/exercises.component';
import { ProfileComponent2 } from './features/profile-2/profile.component';
import { TrainingLogCalendarComponent } from './features/training-logs/training-log-calendar/training-calendar.component';
import { TrainingPlanStatisticsComponent } from './features/training-plans/training-plan-statistics/training-plan-statistics.component';
import { TrainingPlansComponent } from './features/training-plans/training-plans/training-plans.component';
import { SessionViewComponent } from './features/training-session/session-view/session-view.component';
import { TrainingSesssionStatisticsComponent } from './features/training-session/training-session-statistics/training-session-statistics.component';
import { TrainingView2Component } from './features/training-view-2/training-view-2.component';
import { StatisticsComponent } from './features/usage-statistics/statistics.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { BodyWeightComponent } from './features/body-weight/body-weight.component';

export const routes: Routes = [
  { path: 'test', component: TrainingView2Component },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'profile/progression', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'profile/body-weight', component: BodyWeightComponent, canActivate: [AuthGuard] },
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
  { path: 'profile/best-performance', component: BestPerformanceComponent, canActivate: [AuthGuard] },
  {
    path: 'profile/exercises',
    component: ExercisesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'logs',
    component: TrainingLogCalendarComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'training/view',
    component: TrainingView2Component,
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
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
