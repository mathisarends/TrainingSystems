import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconName } from '../../../icon/icon-name';
import { IconComponent } from '../../../icon/icon.component';
import { InfoComponent } from '../../info/info.component';
import { DeleteValidationPipe } from './deletion-validation-class.pipe';

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
  imports: [FormsModule, InfoComponent, CommonModule, DeleteValidationPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationComponent {
  protected readonly IconName = IconName;

  /**
   * Holds the required keyword that the user must type to confirm deletion.
   */
  deletionKeyWord = signal<string>('');

  deleteMessage = computed(
    () =>
      `Bist du sicher, dass du diesen Inhalt löschen möchtest? Bitte gib "${this.deletionKeyWord()}" ein, um den Löschvorgang zu bestätigen.`,
  );

  /**
   * Holds the user's input for the deletion keyword.
   */
  deletionKeyWordUserInput = signal<string>('');
}
