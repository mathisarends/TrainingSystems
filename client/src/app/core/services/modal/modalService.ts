import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  createComponent,
} from '@angular/core';
import { BasicInfoComponent } from '../../../shared/components/modal/basic-info/basic-info.component';
import { ModalOverlayComponent } from '../../../shared/components/modal/modal-overlay/modal-overlay.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BasicInfoModalOptions, ModalOptions } from './modal-options';
import { ModalSize } from './modalSize';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef!: ComponentRef<ModalComponent>;
  private overlayComponentRef!: ComponentRef<ModalOverlayComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
  ) {}

  /**
   * Opens a modal dialog with the specified options.
   *
   * @param options - The options for the modal dialog.
   * @returns A promise that resolves when the modal is confirmed or rejected.
   */
  open(options: ModalOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.overlayComponentRef = createComponent(ModalOverlayComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
      });

      this.appRef.attachView(this.overlayComponentRef.hostView);
      document.body.appendChild(this.overlayComponentRef.location.nativeElement);

      this.modalComponentRef = createComponent(ModalComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
      });

      this.appRef.attachView(this.modalComponentRef.hostView);
      document.body.appendChild(this.modalComponentRef.location.nativeElement);

      this.modalComponentRef.instance.childComponentType = options.component;
      this.modalComponentRef.instance.title = options.title;
      this.modalComponentRef.instance.size = options.size ?? ModalSize.MEDIUM;
      this.modalComponentRef.instance.footer = options.hasFooter ?? true;
      this.modalComponentRef.instance.confirmationRequired = options.confirmationRequired ?? false;

      if (options.isDestructiveAction) {
        this.modalComponentRef.instance.isDestructiveAction = true;
      }

      if (options.buttonText) {
        this.modalComponentRef.instance.confirmButtonText = options.buttonText;
      }

      if (options.secondaryButtonText) {
        this.modalComponentRef.instance.secondaryButtonText = options.secondaryButtonText;
      }

      if (options.componentData) {
        this.modalComponentRef.instance.childComponentData.set(options.componentData);
      }

      this.modalComponentRef.instance.confirmed.subscribe(() => {
        resolve(true);
        this.close();
      });

      this.modalComponentRef.instance.cancelled.subscribe(() => {
        resolve(false);
        this.close();
      });
    });
  }

  // signal basiert umsetzen für den modalService:
  /**
   * Updates the component data of the modal's child component.
   * @param newComponentData - The new data to update the child component with.
   */
  updateComponentData(newComponentData: any) {
    if (this.modalComponentRef) {
      this.modalComponentRef.instance.childComponentData.set(newComponentData);
    } else {
      console.warn('Modal component reference is not available for updating data.');
    }
  }

  /**
   * Opens a basic info modal with predefined options.
   *
   * @param options - The specific options for the basic info modal.
   * @returns A promise that resolves when the modal is confirmed or rejected.
   */
  openBasicInfoModal(options: BasicInfoModalOptions): Promise<boolean> {
    return this.open({
      component: BasicInfoComponent,
      title: options.title,
      buttonText: options.buttonText,
      isDestructiveAction: options.isDestructiveAction,
      componentData: {
        text: options.infoText,
      },
    });
  }

  /**
   * Closes the modal dialog and cleans up the components.
   */
  close() {
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();

    this.appRef.detachView(this.overlayComponentRef.hostView);
    this.overlayComponentRef.destroy();
  }
}
