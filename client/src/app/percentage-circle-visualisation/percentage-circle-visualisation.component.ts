import { AfterViewInit, Component, ElementRef, input, Renderer2, ViewChild } from '@angular/core';
import { Percentage } from './percentage.type';

@Component({
  selector: 'app-percentage-circle-visualisation',
  standalone: true,
  imports: [],
  templateUrl: './percentage-circle-visualisation.component.html',
  styleUrl: './percentage-circle-visualisation.component.scss',
})
export class PercentageCircleVisualisationComponent implements AfterViewInit {
  @ViewChild('progressRing') progressRing!: ElementRef;

  percentage = input.required<Percentage>();
  size = input<number>(100);

  ngAfterViewInit(): void {
    const circle = this.progressRing.nativeElement.querySelector('.progress-ring__circle');
    const radius = circle.r?.baseVal.value;

    const circumference = 2 * Math.PI * radius;

    let offset = (this.percentage() / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
  }
}
