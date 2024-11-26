import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconName } from '../../../icon/icon-name';
import { IconComponent } from '../../../icon/icon.component';
import { InfoComponent } from '../../info/info.component';
import { ModalValidationService } from '../modal-validation.service';
import { Validatable } from '../validatable';
import { DeleteValidationPipe } from './deletion-validation-class.pipe';

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
export class DeleteConfirmationComponent implements OnInit, Validatable {
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

  constructor(private modalValidationService: ModalValidationService) {
    effect(
      () => {
        this.validate();
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.modalValidationService.updateValidationState(false);
  }

  validate(): void {
    const isValid = this.deletionKeyWordUserInput() === this.deletionKeyWord();
    this.modalValidationService.updateValidationState(isValid);
  }

  ngOnDestroy(): void {
    this.modalValidationService.updateValidationState(true);
  }
}
