import { Routes } from '@angular/router';

import { LoginComponent } from './Pages/login/login.component';
import { RegisterComponent } from './register/register.component';

import { LandingComponent } from './Pages/landing/landing.component';
import { TrainingPlansComponent } from './Pages/training-plans/training-plans.component';
import { StatisticsComponent } from './Pages/statistics/statistics.component';
import { ProfileComponent } from './Pages/profile/profile.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { TrainingViewComponent } from './training-view/training-view.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'training', component: TrainingPlansComponent },
  { path: 'training/view', component: TrainingViewComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'spinner', component: SpinnerComponent },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'training/:planId/:week/:day', component: TrainingViewComponent },
];
