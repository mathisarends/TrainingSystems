import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { InfoComponent } from '../../../../shared/components/info/info.component';
import { SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { AutoProgressionService } from './auto-progression.service';

@Component({
  selector: 'app-auto-progression',
  standalone: true,
  imports: [ReactiveFormsModule, InfoComponent, FloatingLabelInputComponent, SwitchComponent],
  templateUrl: './auto-progression.component.html',
  styleUrl: './auto-progression.component.scss',
})
export class AutoProgressionComponent {
  constructor(protected autoProgressionService: AutoProgressionService) {}
}
