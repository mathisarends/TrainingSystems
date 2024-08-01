import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  @Input() options: string[] = [];
  @Output() selectionChange = new EventEmitter<Set<string>>();

  selected = signal(new Set<string>());
  isOpen = signal(false);
  searchTerm = '';

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  filteredOptions(): string[] {
    return this.options.filter((option) =>
      option.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSelectionChange(option: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newSelected = new Set(this.selected());
    if (inputElement.checked) {
      newSelected.add(option);
    } else {
      newSelected.delete(option);
    }
    this.selected.set(newSelected);
    this.selectionChange.emit(newSelected);
  }

  getSelectedText(): string {
    const selectedArray = Array.from(this.selected());
    if (selectedArray.length === 0) {
      return 'Select options';
    }
    return selectedArray.join(', ');
  }
}
