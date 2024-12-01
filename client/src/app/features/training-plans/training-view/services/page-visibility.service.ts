import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageVisibilityService implements OnDestroy {
  private visibilityChangeListener!: () => void;

  private visibilitySubject = new BehaviorSubject<'visible' | 'hidden'>(
    document.visibilityState as 'visible' | 'hidden',
  );

  constructor() {
    this.setupVisibilityListener();
  }

  get visibilityChanges$(): Observable<'visible' | 'hidden'> {
    return this.visibilitySubject.asObservable();
  }

  private setupVisibilityListener(): void {
    this.visibilityChangeListener = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.visibilityChangeListener);
  }

  private handleVisibilityChange(): void {
    const newState = document.visibilityState as 'visible' | 'hidden';
    this.visibilitySubject.next(newState);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.visibilityChangeListener);
  }
}
