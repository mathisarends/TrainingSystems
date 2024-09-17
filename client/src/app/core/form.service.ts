import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private changedData: { [key: string]: any } = {};

  /**
   * Tracks changes from form inputs and stores the changed value.
   * @param event - The event triggered by the form input.
   */
  trackChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.changedData[target.name] = target.value;
  }

  /**
   * Adds or updates a specific key-value pair in the changed data.
   * @param key - The key associated with the data.
   * @param value - The value to be stored.
   */
  addChange(key: string, value: any): void {
    this.changedData[key] = value;
  }

  /**
   * Retrieves all the tracked changes.
   * @returns An object containing all the tracked changes.
   */
  getChanges(): { [key: string]: any } {
    return this.changedData;
  }

  /**
   * Clears all the tracked changes.
   */
  clearChanges(): void {
    this.changedData = {};
  }

  hasUnsavedChanges(): boolean {
    return Object.keys(this.changedData).length > 0;
  }
}
