import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private changedData: { [key: string]: any } = {};

  trackChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.changedData[target.name] = target.value;
  }

  getChanges(): { [key: string]: any } {
    return this.changedData;
  }

  clearChanges(): void {
    this.changedData = {};
  }
}
