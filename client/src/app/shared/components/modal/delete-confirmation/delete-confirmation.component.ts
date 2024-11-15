import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
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
  imports: [FormsModule],
})
export class DeleteConfirmationComponent implements OnConfirm {
  /**
   * Holds the deletion confirmation text to prompt the user.
   */
  infoText = signal<string>('');

  /**
   * Holds the required keyword that the user must type to confirm deletion.
   */
  deletionKeyWord = signal<string>('');

  /**
   * Holds the user's input for the deletion keyword.
   */
  deletionKeyWordUserInput = signal<string>('');

  /**
   * Subject to emit when deletion is confirmed.
   */
  private confirmationSubject = new Subject<void>();

  /**
   * Confirms the deletion action if the user input matches the required keyword.
   * Emits to the confirmation subject when the deletion is confirmed.
   */
  onConfirm(): Observable<void> {
    if (this.deletionKeyWordUserInput() === this.deletionKeyWord()) {
      console.log('Deletion confirmed');
      this.confirmationSubject.next();
      this.confirmationSubject.complete();
    } else {
      console.warn('Deletion keyword does not match');
    }
    return this.confirmationSubject.asObservable();
  }
}
