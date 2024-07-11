import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  searchText$ = this.searchSubject.asObservable();

  /**
   * Updates the search text.
   * @param searchText - The search input text
   */
  updateSearchText(searchText: string): void {
    this.searchSubject.next(searchText);
  }
}
