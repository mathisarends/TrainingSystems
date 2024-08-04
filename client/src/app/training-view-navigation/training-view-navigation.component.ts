import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';
import { PaginationComponent } from '../components/pagination/pagination.component';

import { CheckboxComponent } from '../checkbox/checkbox.component';
import { SwipeService } from '../../service/swipe/swipe.service';

@Component({
  selector: 'app-training-view-navigation',
  standalone: true,
  imports: [AlertComponent, PaginationComponent, CheckboxComponent],
  templateUrl: './training-view-navigation.component.html',
  styleUrl: './training-view-navigation.component.scss',
})
export class TrainingViewNavigationComponent {
  @ViewChildren('swipeContainer') swipeContainers!: QueryList<ElementRef>;
  swipeServiceInit = false;

  currentPage = 0;

  constructor(private swipeService: SwipeService) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (!this.swipeServiceInit) {
      this.swipeContainers.forEach((container) => {
        this.swipeService.addSwipeListener(
          container.nativeElement,
          () => {
            console.log('1');
          },
          () => {
            console.log('2');
          },
          () => {
            console.log('3');
          },
          () => {
            console.log('4');
          }
        );
      });
      this.swipeServiceInit = true;
    }
  }

  changeView(page: number): void {
    this.currentPage = page;
  }
}
