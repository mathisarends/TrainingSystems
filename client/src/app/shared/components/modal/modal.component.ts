import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  EnvironmentInjector,
  ViewChild,
  ViewContainerRef,
  createComponent,
  output,
} from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { DataMap } from '../../types/data-map';
import { ButtonComponent } from '../button/button.component';
import { OnConfirm } from './on-confirm';
import { OnToggleView } from './on-toggle-view';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit {
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;
  childComponentRef!: ComponentRef<any>;

  /**
   * The title of the modal. This is displayed in the modal header.
   */
  title: string = 'Default Title';

  /**
   * Determines whether the action associated with the modal is destructive (e.g., deletion).
   */
  isDestructiveAction: boolean = false;

  /**
   * Text to display on the secondary button, typically used for actions like "Cancel".
   */
  secondaryButtonText?: string;

  /**
   * Text to display on the confirmation button, typically used for actions like "Confirm".
   */
  confirmButtonText: string = 'Bestätigen';

  /**
   * The type of the component that should be dynamically loaded into the modal body.
   */
  childComponentType!: any;

  /**
   * Data to be passed to the dynamically loaded child component within the modal.
   */
  childComponentData!: DataMap | null;

  /**
   * The size of the modal (small, medium, large). Controls the modal's width.
   */
  size: ModalSize = ModalSize.MEDIUM;

  /**
   * Controls whether the footer (usually containing buttons) is visible in the modal.
   */
  footer: boolean = false;

  /**
   * Indicates whether a confirmation is required for the action (e.g., form validation before closing).
   */
  confirmationRequired: boolean = true;

  /**
   * Emits an event when the confirm action is triggered by the user (e.g., clicking the confirm button).
   */
  confirmed = output<void>();

  /**
   * Emits an event when the cancel action is triggered by the user (e.g., clicking the cancel button or closing the modal).
   */
  cancelled = output<void>();

  constructor(
    private environmentInjector: EnvironmentInjector,
    private modalService: ModalService,
  ) {}

  ngAfterViewInit() {
    this.loadChildComponent();
  }

  /**
   * Loads the child component dynamically into the modal content.
   * The component's inputs will be set from the passed `childComponentData`.
   */
  loadChildComponent() {
    if (!this.childComponentType) {
      return;
    }

    this.childComponentRef = createComponent(this.childComponentType, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.modalContent.injector,
    });

    this.modalContent.insert(this.childComponentRef.hostView);

    if (this.childComponentData) {
      this.setChildComponentInputs(this.childComponentData);
    }
  }

  /**
   * Sets inputs for the dynamically loaded child component.
   * Only properties that exist in the child component will be set.
   */
  private setChildComponentInputs(data: any): void {
    Object.keys(data).forEach((key) => {
      this.childComponentRef.instance[key] = data[key];
    });
  }

  /**
   * Closes the modal and emits the `cancelled` event.
   */
  close() {
    this.cancelled.emit();
    this.modalService.close();
  }

  /**
   * Confirms the modal's action and emits the `confirmed` event.
   * Calls `onConfirm` if the child component implements `ConfirmableComponent`.
   */
  confirm() {
    const componentInstance = this.childComponentRef.instance;
    if (this.implementsOnConfirm(componentInstance)) {
      componentInstance.onConfirm();
    }

    if (!this.confirmationRequired) {
      this.modalService.close();
    }

    this.confirmed.emit();
  }

  /**
   * Toggles the modal view if the child component defines an `onToggleView` method.
   */
  toggleModalView() {
    const componentInstance = this.childComponentRef.instance;
    if (this.implementsOnToggleView(componentInstance)) {
      componentInstance.onToggleView();
    }
  }

  /**
   * Type guard to check if a component is ConfirmableComponent
   */
  private implementsOnConfirm(component: any): component is OnConfirm {
    return (component as OnConfirm).onConfirm !== undefined;
  }

  /**
   * Type guard to check if a component is ToggleableViewComponent
   */
  private implementsOnToggleView(component: any): component is OnToggleView {
    return (component as OnToggleView).onToggleView !== undefined;
  }
}
