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
  @Output() selectionChange = new EventEmitter<string[]>();

  selected = signal<string[]>([]); // Use a signal holding an array of strings
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
    const newSelected = [...this.selected()]; // Create a copy of the array

    if (inputElement.checked) {
      newSelected.push(option);
    } else {
      const index = newSelected.indexOf(option);
      if (index > -1) {
        newSelected.splice(index, 1); // Remove the item from the array
      }
    }

    this.selected.set(newSelected); // Update the signal with the new array
    this.selectionChange.emit(newSelected); // Emit the updated array
  }

  getSelectedText(): string {
    const selectedArray = this.selected();
    const characterLimit = 30; // Set your desired character limit
    let displayedText = '';

    for (let i = 0; i < selectedArray.length; i++) {
      const nextItem = selectedArray[i];
      if ((displayedText + nextItem).length > characterLimit) {
        displayedText += ', ...';
        break;
      }
      if (displayedText.length > 0) {
        displayedText += ', ';
      }
      displayedText += nextItem;
    }

    return displayedText || 'Select options';
  }
}
