import { Component } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { ToastService } from '../components/toast/toast.service';

@Component({
  selector: 'app-training-view-navigation',
  standalone: true,
  imports: [AlertComponent, PaginationComponent],
  templateUrl: './training-view-navigation.component.html',
  styleUrl: './training-view-navigation.component.scss',
})
export class TrainingViewNavigationComponent {
  currentPage = 0;

  changeView(page: number): void {
    this.currentPage = page;
  }
}
