import {
  AfterViewInit,
  Component,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  createComponent,
} from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { ButtonComponent } from '../button/button.component';
import { OnConfirm } from './on-confirm';
import { OnToggleView } from './on-toggle-view';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit {
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @Input() title: string = 'Default Title';
  @Input() isDestructiveAction: boolean = false;
  @Input() secondaryButtonText: string = '';
  @Input() confirmButtonText: string = 'Bestätigen';
  @Input() childComponentType!: any;
  @Input() childComponentData: any;
  @Input() size: ModalSize = ModalSize.MEDIUM;
  @Input() footer: boolean = false;
  @Input() confirmationRequired = true;
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;
  childComponentRef!: ComponentRef<any>;

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
