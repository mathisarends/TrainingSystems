import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SelectedPagePipe } from './selected-page.pipe';

/**
 * Rrovides a paginated navigation interface.
 * It allows users to navigate through a list of pages and emits
 * events when the page changes.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [SelectedPagePipe],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  /**
   * The current page number in the pagination.
   */
  currentPage = input.required<number>();

  /**
   * The total number of pages available for pagination.
   */
  totalPages = input.required<number>();

  /**
   * Emits an event whenever the user selects a new page.
   */
  pageChanged = output<number>();

  /**
   * Generates an array with a given number of elements, used to create the page range.
   * This array is then used to render the individual page numbers in the template.
   */
  createRange(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  /**
   * Handles the page navigation event. This method prevents the default behavior of the event,
   * verifies the page number is valid, and emits the `pageChanged` event with the selected page.
   */
  navigatePage(page: number, event: Event): void {
    event.preventDefault();
    if (page >= 0 && page < this.totalPages()) {
      this.pageChanged.emit(page);
    }
  }

  /**
   * Determines whether a specific page is currently selected.
   * This method is used to apply the `is-active` class in the template.
   */
  isSelected(page: number): boolean {
    return page === this.currentPage();
  }
}
