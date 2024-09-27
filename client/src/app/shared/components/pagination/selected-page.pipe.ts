import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to determine if the given page is selected.
 */
@Pipe({
  name: 'selectedPage',
  standalone: true,
})
export class SelectedPagePipe implements PipeTransform {
  /**
   * Transforms the page number to a boolean indicating if it's the selected page.
   *
   * @param page - The page number to check.
   * @param currentPage - The current page number.
   * @returns boolean - True if the page is selected, false otherwise.
   */
  transform(page: number, currentPage: number): boolean {
    return page === currentPage;
  }
}
