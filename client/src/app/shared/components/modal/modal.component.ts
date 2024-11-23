import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  computed,
  createComponent,
  DestroyRef,
  effect,
  EnvironmentInjector,
  Injector,
  OnInit,
  output,
  signal,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../core/services/modal/modal.service';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { MobileDeviceDetectionService } from '../../../platform/mobile-device-detection.service';
import { DraggableDirective } from '../../directives/draggable.directive';
import { IconName } from '../../icon/icon-name';
import { IconComponent } from '../../icon/icon.component';
import { KeyboardService } from '../../service/keyboard.service';
import { DataMap } from '../../types/data-map';
import { ButtonComponent } from '../button/button.component';
import { CircularIconButtonComponent } from '../circular-icon-button/circular-icon-button.component';
import { ToastService } from '../toast/toast.service';
import { ModalPaginationComponent } from './modal-pagination/modal-pagination.component';
import { OnToggleView } from './on-toggle-view';
import { ModalTab } from './types/modal-tab';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    DraggableDirective,
    CircularIconButtonComponent,
    IconComponent,
    ModalPaginationComponent,
  ],
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
  title: string = 'Modal title';

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
  footer: boolean = true;

  /**
   * Indicates whether a confirmation is required for the action (e.g., form validation before closing).
   */
  confirmationRequired: boolean = true;

  /**
   * Holds the modal tabs.
   */
  tabs = signal<ModalTab[]>([]);

  activeTab = signal<ModalTab | undefined>(undefined);

  /**
   * Computed property to get the index of the active tab.
   */
  activeTabIndex = computed(() => this.getActiveTabIndex());

  confirmed = output<void>();

  cancelled = output<void>();

  constructor(
    protected mobileDeviceDetectionService: MobileDeviceDetectionService,
    private environmentInjector: EnvironmentInjector,
    private modalService: ModalService,
    private toastService: ToastService,
    private keyboardService: KeyboardService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) {
    effect(
      () => {
        this.activeTab.set(this.tabs()[0]);
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      if (this.activeTab()) {
        this.loadTabComponent(this.activeTab()!);
      }
    });
  }

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

  /**
   * Loads the child component dynamically into the modal content.
   * The component's inputs will be set from the passed `childComponentData`.
   */
  ngAfterViewInit() {
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
  close(): void {
    this.cancelled.emit();
  }

  /**
   * Confirms the modal's action and emits the `confirmed` event.
   * Calls `onConfirm` if the child component implements `ConfirmableComponent` and waits for its completion.
   */
  async confirm() {
    if (this.isModalGroupAndNotLastTab()) {
      this.switchToNextTab();
      return;
    }

    if (this.modalService.onValidateCallback) {
      const validationResult = this.modalService.onValidateCallback();
      if (typeof validationResult === 'string') {
        this.toastService.error(validationResult);
        return;
      }
    }

    if (this.modalService.onSubmitCallback) {
      this.isLoading.set(true);
      try {
        await this.modalService.onSubmitCallback();
        this.confirmed.emit();
      } catch (error) {
        this.toastService.error('An error occurred while processing the request.');
        console.error(error);
      } finally {
        this.isLoading.set(false);
      }
    }

    this.confirmed.emit();
  }

  private isModalGroupAndNotLastTab(): boolean {
    const isModalGroup = this.tabs().length > 0;
    const isNotLastTab = this.activeTabIndex() < this.tabs().length - 1;

    return isModalGroup && isNotLastTab;
  }

  private switchToNextTab(): void {
    const nextTabIndex = this.activeTabIndex() + 1;
    if (nextTabIndex > this.tabs().length - 1) {
      throw new Error('Next tab is non exisitng');
    }

    this.activeTab.set(this.tabs()[nextTabIndex]);
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
   * Switches to the previous tab in the modal, with overflow handling to loop back to the last tab.
   */
  private switchToPreviousTab(): void {
    const currentIndex = this.activeTabIndex();
    const previousIndex = (currentIndex - 1 + this.tabs().length) % this.tabs().length;

    this.activeTab.set(this.tabs()[previousIndex]);
  }

  /**
   * Switches to the next tab in the modal, with overflow handling to loop back to the first tab.
   */
  private switchToNextTabWithOverflow(): void {
    const currentIndex = this.activeTabIndex();
    const nextIndex = (currentIndex + 1) % this.tabs().length;

    this.activeTab.set(this.tabs()[nextIndex]);
  }

  private loadTabComponent(modalTab: ModalTab): void {
    this.modalContent.clear();

    const componentRef = createComponent(modalTab.component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.modalContent.injector,
    });

    this.title = modalTab.label;

    this.modalContent.insert(componentRef.hostView);
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

  private getActiveTabIndex(): number {
    const currentTab = this.activeTab();
    return currentTab ? this.tabs().findIndex((tab) => tab.label === currentTab.label) : -1;
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

    this.keyboardService
      .arrowLeftPressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.switchToPreviousTab();
      });

    this.keyboardService
      .arrowRightPressed$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.switchToNextTabWithOverflow();
      });
  }
}
