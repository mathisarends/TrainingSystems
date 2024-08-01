import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Represents a generic multi-select-dropdown
 */

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

  selected = signal<string[]>([]);
  isOpen = signal(false);
  searchTerm = '';

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  filteredOptions(): string[] {
    return this.options.filter((option) =>
      option.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSelectionChange(option: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newSelected = [...this.selected()];

    if (inputElement.checked) {
      newSelected.push(option);
    } else {
      const index = newSelected.indexOf(option);
      if (index > -1) {
        newSelected.splice(index, 1);
      }
    }

    this.selected.set(newSelected);
    this.selectionChange.emit(newSelected);
  }

  getSelectedText(): string {
    const selectedArray = this.selected();
    const characterLimit = 30;
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

  /**
   * Closes the dropdown if clicked outside the component
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !target.closest('app-multi-select')) {
      this.isOpen.set(false);
    }
  }
}
