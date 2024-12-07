import { Component } from '@angular/core';
import { VolumeCalculatorService } from './volume-calculator.service';

@Component({
  selector: 'app-volume-calculator',
  standalone: true,
  templateUrl: './volume-calculator.component.html',
  styleUrls: ['./volume-calculator.component.scss'],
})
export class VolumeCalculatorComponent {
  constructor(private volumeCalculatorService: VolumeCalculatorService) {}
}
