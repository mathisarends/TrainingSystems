import { Component } from '@angular/core';
import { Slide } from '../../types/slide';

import { CarouselComponent } from '../../components/carousel/carousel.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CarouselComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  carouselSlides: Slide[] = [
    {
      image: '/images/carousel/evo-gym-2.webp',
      alt: 'First slide',
      label: 'First slide label',
      text: 'Some representative placeholder content for the first slide.',
    },
    {
      image: '/images/carousel/evo-gym.webp',
      alt: 'Second slide',
      label: 'Second slide label',
      text: 'Some representative placeholder content for the second slide.',
    },
    {
      image: '/images/carousel/evo-gym-2.webp',
      alt: 'Third slide',
      label: 'Third slide label',
      text: 'Some representative placeholder content for the third slide.',
    },
  ];
}
