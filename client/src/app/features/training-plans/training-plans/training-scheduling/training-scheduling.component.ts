import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-training-scheduling',
  standalone: true,
  imports: [AlertComponent, CommonModule],
  templateUrl: './training-scheduling.component.html',
  styleUrls: ['./training-scheduling.component.scss'],
})
export class TrainingSchedulingComponent {}
