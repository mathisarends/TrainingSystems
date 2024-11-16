import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  effect,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  OnInit,
  Output,
  signal,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, first, firstValueFrom, Observable } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { MobileDeviceDetectionService } from '../../../platform/mobile-device-detection.service';
import { DraggableDirective } from '../../directives/draggable.directive';
import { IconName } from '../../icon/icon-name';
import { KeyboardService } from '../../service/keyboard.service';
import { DataMap } from '../../types/data-map';
import { ButtonComponent } from '../button/button.component';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ModalConfirmationService } from './modal-confirmation.service';
import { OnConfirm } from './on-confirm';
import { OnToggleView } from './on-toggle-view';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent, CommonModule, DraggableDirective, CircularIconButtonComponent, PaginationComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [KeyboardService],
})
export class ModalComponent implements AfterViewInit, OnInit {
  protected readonly IconName = IconName;

  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;
  childComponentRef!: ComponentRef<any>;

  isLoading = signal(false);

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
  childComponentData: WritableSignal<DataMap | null> = signal(null);

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
  @Output() confirmed = new EventEmitter<void>();

  /**
   * Emits an event when the cancel action is triggered by the user (e.g., clicking the cancel button or closing the modal).
   */
  @Output() cancelled = new EventEmitter<void>();

  @Output() closed = new EventEmitter<void>();

  constructor(
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private modalConfirmationService: ModalConfirmationService,
    private environmentInjector: EnvironmentInjector,
    private modalService: ModalService,
    private keyboardService: KeyboardService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        if (this.childComponentData()) {
          this.setChildComponentInputs(this.childComponentData());
        }
      },
      { injector: this.injector, allowSignalWrites: true },
    );

    this.initializeKeyboardListeners();
  }

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
   * Calls `onConfirm` if the child component implements `ConfirmableComponent` and waits for its completion.
   */
  async confirm() {
    const componentInstance = this.childComponentRef.instance;

    if (this.implementsOnConfirm(componentInstance)) {
      const result = componentInstance.onConfirm();

      if (this.confirmationRequired) {
        await this.handleConfirmationRequired();
      }

      if (result instanceof Observable) {
        this.isLoading.set(true);

        try {
          await firstValueFrom(result);
        } finally {
          this.isLoading.set(false);
        }
      }
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
   * Initializes keyboard listeners for 'Escape' and 'Enter' keys.
   */
  private initializeKeyboardListeners(): void {
    this.keyboardService
      .escapePressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.modalService.close();
      });

    this.keyboardService
      .enterPressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.confirm();
      });
  }

  private async handleConfirmationRequired() {
    const confirmed = await firstValueFrom(
      this.modalConfirmationService.requestConfirmation().pipe(
        filter((value): value is boolean => value === true),
        first(),
      ),
    );

    if (confirmed) {
      this.confirmed.emit();
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

  /**
   * Sets inputs for the dynamically loaded child component.
   * Detects if a target property is a signal, and updates the signal instead of direct property assignment.
   */
  private setChildComponentInputs(data: any): void {
    Object.keys(data).forEach((key) => {
      const instanceProperty = this.childComponentRef.instance[key];

      if (this.isSignal(instanceProperty)) {
        (instanceProperty as WritableSignal<any>).set(data[key]);
      } else {
        this.childComponentRef.instance[key] = data[key];
      }
    });
  }

  /**
   * Checks if a given property is a Signal.
   *
   * @param property - The property to check.
   * @returns True if the property is a Signal, false otherwise.
   */
  private isSignal(property: any): boolean {
    return property && typeof property === 'function' && 'set' in property;
  }
}
