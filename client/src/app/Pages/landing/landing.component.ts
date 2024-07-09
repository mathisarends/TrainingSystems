import { Component } from '@angular/core';
import { Slide } from '../../types/slide';

import { CarouselComponent } from '../../components/carousel/carousel.component';
import { HeroComponent } from '../../hero/hero.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CarouselComponent, HeroComponent],
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

  heroHeadline = 'Training Systems';
  heroLeadTexts = [
    'Track Your Powerlifting Progress and Connect with the Community!',
    'Join Training Systems to record your powerlifting journey, set personal records, and share your achievements with fellow lifters.',
    "Whether you're a beginner or an experienced lifter, our app provides a platform to inspire, support, and learn from each other's successes.",
    'Our advanced tracking system ensures you never miss a workout, offering tailored plans and progress reports. Engage with a community of like-minded lifters, join challenges, and find inspiration from others’ journeys. With Training Systems, every lift counts!',
  ];
  heroButtonText = 'Get Started';
}
