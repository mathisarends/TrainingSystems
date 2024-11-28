import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconName } from '../../../icon/icon-name';
import { FormInputComponent } from '../../form-input/form-input.component';
import { InfoComponent } from '../../info/info.component';
import { ModalValidationService } from '../modal-validation.service';
import { Validatable } from '../validatable';

/**
 * A modal component for confirming deletion of an item.
 * The user must type the item's name (or a specified keyword) to confirm the deletion.
 */
@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
  standalone: true,
  imports: [InfoComponent, FormInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationComponent implements OnInit, Validatable {
  protected readonly IconName = IconName;

  markInputFieldAsTouched = signal(false);

  /**
   * Holds the required keyword that the user must type to confirm deletion. Typically set via the modal service.
   */
  deletionKeyWord = signal<string>('');

  /**
   * Dynamically generates a regex pattern based on the deletion keyword.
   * Ensures that the user input matches the exact keyword.
   */
  deletionKeyWordRegex = computed(() => `^${this.deletionKeyWord()}$`);

  /**
   * Generates a confirmation message instructing the user to type the deletion keyword.
   */
  deleteMessage = computed(
    () =>
      `Bist du sicher, dass du diesen Inhalt löschen möchtest? Bitte gib "${this.deletionKeyWord()}" ein, um den Löschvorgang zu bestätigen.`,
  );

  /**
   * Computes whether the user input matches the required deletion keyword.
   */
  isDeletionKeyWordMatched = computed(() => this.deletionKeyWordUserInput() === this.deletionKeyWord());

  /**
   * Dynamically sets the icon based on whether the deletion keyword matches.
   * Displays a check icon when the input is valid.
   */
  icon = computed(() => (this.isDeletionKeyWordMatched() ? IconName.CHECK_CIRCLE : undefined));

  /**
   * Holds the user's input for the deletion keyword.
   */
  deletionKeyWordUserInput = signal<string>('');

  constructor(
    private modalValidationService: ModalValidationService,
    private destroyRef: DestroyRef,
  ) {
    effect(
      () => {
        this.validate();
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Initializes the component and sets the initial validation state.
   * Subscribes to form validation triggers to mark the input field as touched.
   */
  ngOnInit(): void {
    this.modalValidationService.updateValidationState(false);

    this.modalValidationService.triggerFormValidation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.markInputFieldAsTouched.set(true);
    });
  }

  /**
   * Resets the validation state when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.modalValidationService.updateValidationState(true);
  }

  /**
   * Validates the user's input and updates the validation state in the modal service.
   */
  validate(): void {
    this.modalValidationService.updateValidationState(this.isDeletionKeyWordMatched());
  }
}
