import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-features.component.html',
  styleUrls: ['./test-features.component.scss'],
})
export class TestFeaturesComponent {
  days: number[] = Array.from({ length: 18 }, (_, i) => i + 1); // Beispiel-Tage
  columns = 9;

  showRowButton = false;
  showColumnButton = false;

  buttonRowPosition = { top: 0, left: 0 };
  buttonColumnPosition = { top: 0, left: 0 };

  constructor() {}

  isLastRow(index: number): boolean {
    return index >= this.days.length - this.columns;
  }

  // Prüft, ob eine Zelle in der letzten Spalte ist
  isLastColumn(index: number): boolean {
    return (index + 1) % this.columns === 0;
  }

  onMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.classList.contains('day')) {
      const rect = target.getBoundingClientRect();
      const index = parseInt(target.getAttribute('data-index') || '0', 10);

      // Wenn letzte Zeile
      if (this.isLastRow(index)) {
        this.showRowButton = true;
        this.buttonRowPosition = { top: rect.bottom, left: rect.left + rect.width / 2 };
      }

      // Wenn letzte Spalte
      if (this.isLastColumn(index)) {
        this.showColumnButton = true;
        this.buttonColumnPosition = { top: rect.top + rect.height / 2, left: rect.right };
      }
    }
  }

  onMouseOut() {
    this.showRowButton = false;
    this.showColumnButton = false;
  }

  addRow() {
    for (let i = 0; i < this.columns; i++) {
      this.days.push(this.days.length + 1);
    }
  }

  addColumn() {
    this.columns++;
  }
}
