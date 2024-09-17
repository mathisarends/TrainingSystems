import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartColorService {
  private colors: {
    [key: string]: { borderColor: string; backgroundColor: string };
  } = {
    squat: {
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
    bench: {
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
    deadlift: {
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    overheadpress: {
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    back: {
      borderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
    },
    chest: {
      borderColor: 'rgba(255, 206, 86, 1)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
    },
    shoulder: {
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    biceps: {
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    triceps: {
      borderColor: 'rgba(201, 203, 207, 1)',
      backgroundColor: 'rgba(201, 203, 207, 0.2)',
    },
    legs: {
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
    rdm: {
      borderColor: 'rgba(201, 203, 207, 1)',
      backgroundColor: 'rgba(201, 203, 207, 0.2)',
    },
  };

  /**
   * Retrieves the color settings (border color and background color) for a specific exercise category.
   * If the category is not found, a random predefined color is returned.
   * @param category - The name of the exercise category.
   * @returns An object containing the borderColor and backgroundColor for the category.
   */
  getCategoryColor(category: string): {
    borderColor: string;
    backgroundColor: string;
  } {
    if (this.colors[category]) {
      return this.colors[category];
    } else {
      // Wenn die Kategorie nicht gefunden wird, eine zufällige Farbe auswählen
      const randomKey = this.getRandomColorKey();
      return this.colors[randomKey];
    }
  }

  /**
   * Returns a random key from the predefined colors.
   * @returns A random key representing an exercise category.
   */
  private getRandomColorKey(): string {
    const keys = Object.keys(this.colors);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }
}
