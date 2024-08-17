import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service to manage search text across the application.
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
