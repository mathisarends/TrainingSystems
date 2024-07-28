import {
  Injectable,
  ApplicationRef,
  Injector,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { ModalComponent } from '../../app/components/modal/modal.component';
import { ModalOverlayComponent } from '../../app/components/modal-overlay/modal-overlay.component';
import { ModalSize } from './modalSize';
import { ModalOptions } from './modal-options';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef!: ComponentRef<ModalComponent>;
  private overlayComponentRef!: ComponentRef<ModalOverlayComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  /**
   * Opens a modal dialog with the specified options.
   *
   * @param options - The options for the modal dialog.
   */
  open(options: ModalOptions) {
    // added size parameter
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
    this.modalComponentRef.instance.confirmButtonText = options.buttonText;
    this.modalComponentRef.instance.size = options.size ?? ModalSize.MEDIUM; // set the size
    this.modalComponentRef.instance.footer = options.hasFooter ?? true;
    this.modalComponentRef.instance.confirmationRequired =
      options.confirmationRequired ?? false;

    if (options.componentData) {
      console.log('🚀 ~ ModalService ~ componentData:', options.componentData);
      this.modalComponentRef.instance.childComponentData =
        options.componentData;
    }

    if (options.minHeight) {
      this.modalComponentRef.location.nativeElement.style.minHeight = `${options.minHeight}px`;
    }
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
