import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() currentPage!: number;
  @Input() totalPages!: number;

  @Output() pageChanged = new EventEmitter<number>();

  createRange(length: number): number[] {
    return Array.from({ length }, (_, i) => i); // Zero-based
  }

  navigatePage(page: number, event: Event): void {
    this.currentPage = page;

    event.preventDefault();
    if (page >= 0 && page < this.totalPages) {
      this.pageChanged.emit(page);
    }
  }

  isSelected(page: number): boolean {
    return page === this.currentPage;
  }
}
