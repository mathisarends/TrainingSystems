import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-training-view-navigation',
  standalone: true,
  imports: [AlertComponent, PaginationComponent],
  templateUrl: './training-view-navigation.component.html',
  styleUrl: './training-view-navigation.component.scss',
})
export class TrainingViewNavigationComponent {
  @ViewChildren('swipeContainer') swipeContainers!: QueryList<ElementRef>;
  swipeServiceInit = false;

  currentPage = 0;

  ngOnInit(): void {}

  changeView(page: number): void {
    this.currentPage = page;
  }
}
