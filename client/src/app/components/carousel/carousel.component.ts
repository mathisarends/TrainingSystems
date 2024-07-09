import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slide } from '../../types/slide';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent {
  @Input() slides: Slide[] = [];
}
