import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal<number>(0);

  // Use computed signal to derive isLoading from activeRequests
  isLoading = computed(() => this.activeRequests() > 0);

  startLoading() {
    this.activeRequests.update((count) => count + 1);
  }

  stopLoading() {
    this.activeRequests.update((count) => Math.max(count - 1, 0));
  }
}
