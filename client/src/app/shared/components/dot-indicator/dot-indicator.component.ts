import { CommonModule } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-dot-indicator',
  templateUrl: './dot-indicator.component.html',
  styleUrls: ['./dot-indicator.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DotIndicatorComponent {
  activeIndex = model(0);
  totalDots = input.required<number>();
  totalDotsIterable = computed(() => Array.from({ length: this.totalDots() }, (_, i) => i));

  protected updateActiveIndex(index: number, event: Event) {
    event.preventDefault();
    this.activeIndex.set(index);
  }
}
