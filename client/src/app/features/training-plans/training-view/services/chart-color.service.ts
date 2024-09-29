import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartColorService {
  private colors: {
    [key: string]: { borderColor: string; backgroundColor: string };
  } = {
    Squat: {
      borderColor: 'rgba(255, 99, 132, 1)', // Red
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
    Bench: {
      borderColor: 'rgba(54, 162, 235, 1)', // Blue
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
    Deadlift: {
      borderColor: 'rgba(75, 192, 192, 1)', // Teal
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    Overheadpress: {
      borderColor: 'rgba(153, 102, 255, 1)', // Purple
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    Back: {
      borderColor: 'rgba(255, 159, 64, 1)', // Orange
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
    },
    Chest: {
      borderColor: 'rgba(255, 206, 86, 1)', // Yellow
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
    },
    Shoulder: {
      borderColor: 'rgba(75, 192, 192, 1)', // Teal
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    Biceps: {
      borderColor: 'rgba(153, 102, 255, 1)', // Purple
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    Triceps: {
      borderColor: 'rgba(201, 203, 207, 1)', // Grey
      backgroundColor: 'rgba(201, 203, 207, 0.2)',
    },
    Legs: {
      borderColor: 'rgba(54, 162, 235, 1)', // Blue
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },

    // Weekday Colors
    Montag: {
      borderColor: 'rgba(255, 99, 132, 1)', // Bright Red
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
    Dienstag: {
      borderColor: 'rgba(54, 162, 235, 1)', // Bright Blue
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
    Mittwoch: {
      borderColor: 'rgba(255, 206, 86, 1)', // Bright Yellow
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
    },
    Donnerstag: {
      borderColor: 'rgba(75, 192, 192, 1)', // Bright Teal
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    Freitag: {
      borderColor: 'rgba(153, 102, 255, 1)', // Bright Purple
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
    },
    Samstag: {
      borderColor: 'rgba(255, 159, 64, 1)', // Bright Orange
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
    },
    Sonntag: {
      borderColor: 'rgba(75, 192, 192, 1)', // Bright Teal
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },

    rdm: {
      borderColor: 'rgba(201, 203, 207, 1)', // Light Grey (Random)
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
      return this.getRandomColor();
    }
  }

  /**
   * Returns a random key from the predefined colors.
   * @returns A random key representing an exercise category.
   */
  getRandomColor(): {
    borderColor: string;
    backgroundColor: string;
  } {
    const keys = Object.keys(this.colors);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomKey = keys[randomIndex];
    return this.colors[randomKey];
  }
}
