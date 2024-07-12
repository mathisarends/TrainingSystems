import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service to manage search text across the application.
 *
 * The `SearchService` is used to share the search input text between different
 * components. It uses a `BehaviorSubject` to hold the current search text and
 * allows components to subscribe to changes or update the search text.
 *
 * @example
 * // Injecting SearchService into a component
 * constructor(private searchService: SearchService) {}
 *
 * // Updating the search text
 * this.searchService.updateSearchText('new search text');
 *
 * // Subscribing to search text changes
 * this.searchService.searchText$.subscribe(searchText => {
 *   console.log('Search text changed:', searchText);
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  /**
   * The subject that holds the current search text.
   */
  private searchSubject = new BehaviorSubject<string>('');

  /**
   * Observable stream of the current search text.
   *
   * Components can subscribe to this observable to get notified of search text changes.
   */
  searchText$: Observable<string> = this.searchSubject.asObservable();

  /**
   * Updates the current search text.
   *
   * @param searchText - The new search input text.
   * @example
   * this.searchService.updateSearchText('new search text');
   */
  updateSearchText(searchText: string): void {
    this.searchSubject.next(searchText);
  }
}
