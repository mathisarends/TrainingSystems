import { Injectable, signal, computed } from '@angular/core';

/**
 * Service to manage the global loading state of the application.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal<number>(0);

  /**
   * A computed signal that determines if the loading indicator should be displayed.
   */
  isLoading = computed(() => this.activeRequests() > 0);

  /**
   * Starts a new loading event by incrementing the count of active requests.
   *
   * This method should be called whenever a new asynchronous operation starts,
   * such as when an HTTP request is initiated. It ensures that the loading
   * indicator remains visible until all requests are finished.
   */
  startLoading() {
    this.activeRequests.update((count) => count + 1);
  }

  /**
   * Stops a loading event by decrementing the count of active requests.
   * 
   * This method should be called whenever an asynchronous operation completes,
   * such as when an HTTP request finishes. The count is decremented, and if
   * there are no more active requests, the loading indicator will be hidden.
   * 

   */
  stopLoading() {
    this.activeRequests.update((count) => Math.max(count - 1, 0));
  }
}
