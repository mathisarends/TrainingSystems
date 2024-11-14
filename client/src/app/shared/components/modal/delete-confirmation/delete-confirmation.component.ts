import { Component, signal } from '@angular/core';
import { OnConfirm } from '../on-confirm';

// TODDO: finish deletion keyword
/**
 * A modal component for confirming deletion of an item.
 * The user must type the item's name (or a specified keyword) to confirm the deletion.
 */
@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
  standalone: true,
})
export class DeleteConfirmationComponent implements OnConfirm {
  /**
   * Holds the deletion confirmation text to prompt the user.
   */
  deletionText = signal<string>('');

  /**
   * Holds the required keyword that the user must type to confirm deletion.
   */
  deletionKeyWord = signal<string>('');

  /**
   * Holds the user's input for the deletion keyword.
   */
  deletionKeyWordUserInput = signal<string>('');

  /**
   * Confirms the deletion action if the user input matches the required keyword.
   * Intended to be called when the user clicks the "Confirm" button.
   */
  onConfirm(): void {
    if (this.deletionKeyWordUserInput() === this.deletionKeyWord()) {
      console.log('Deletion confirmed');
    } else {
      console.warn('Deletion keyword does not match');
    }
  }
}
