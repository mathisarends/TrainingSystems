import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Provider,
  createComponent,
  signal,
} from '@angular/core';
import { BasicInfoComponent } from '../../../shared/components/modal/basic-info/basic-info.component';
import { DeleteConfirmationComponent } from '../../../shared/components/modal/delete-confirmation/delete-confirmation.component';
import { ModalConfirmationService } from '../../../shared/components/modal/modal-confirmation.service';
import { ModalOverlayComponent } from '../../../shared/components/modal/modal-overlay/modal-overlay.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BasicInfoModalOptions } from './basic-info/basic-info-modal-options';
import { DeleteModalModalOptions } from './deletion/delete-modal-options';
import { ModalOptions } from './modal-options';
import { ModalSize } from './modalSize';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef!: ComponentRef<ModalComponent>;
  private overlayComponentRef!: ComponentRef<ModalOverlayComponent>;

  isVisible = signal(false);

  loading = signal(false);

  onSubmitCallback?: () => void | Promise<void>;

  onValidateCallback?: () => true | string | void;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private modalConfirmationService: ModalConfirmationService,
  ) {}

  /**
   * Opens a modal dialog with the specified options.
   *
   * @param options - The options for the modal dialog.
   * @returns A promise that resolves when the modal is confirmed or rejected.
   */
  open(options: ModalOptions): void {
    this.createOverlayComponent();

    this.createModalComponent(options);

    this.setModalInstanceOptions(options);

    this.isVisible.set(true);

    this.modalComponentRef.instance.confirmed.subscribe(() => {
      this.close();
    });

    this.modalComponentRef.instance.cancelled.subscribe(() => {
      this.close();
    });
  }

  openModalTabs(options: ModalOptions) {
    this.createOverlayComponent();

    this.createModalComponent(options);

    this.setModalInstanceOptions(options);

    if (options.tabs) {
      this.modalComponentRef.instance.tabs.set(options.tabs);
    }

    this.isVisible.set(true);

    this.modalComponentRef.instance.confirmed.subscribe(() => {
      this.close();
    });

    this.modalComponentRef.instance.cancelled.subscribe(() => {
      this.close();
    });
  }

  private resolveProviderMap(providerMap?: Map<any, any>): Provider[] {
    if (!providerMap) {
      return [];
    }

    return Array.from(providerMap.entries()).map(([provide, useValue]) => ({
      provide,
      useValue,
    }));
  }

  /**
   * Opens a basic info modal with predefined options.
   *
   * @param options - The specific options for the basic info modal.
   * @returns A promise that resolves when the modal is confirmed or rejected.
   */
  openBasicInfoModal(options: BasicInfoModalOptions): void {
    if (options.onSubmitCallback) {
      this.onSubmitCallback = options.onSubmitCallback;
    }

    this.open({
      component: BasicInfoComponent,
      title: options.title,
      buttonText: options.buttonText ?? 'Verstanden',
      componentData: {
        infoText: options.infoText,
      },
    });
  }

  openDeletionModal(options: DeleteModalModalOptions) {
    if (options.onSubmitCallback) {
      this.onSubmitCallback = options.onSubmitCallback;
    }

    return this.open({
      component: DeleteConfirmationComponent,
      title: options.title,
      buttonText: options.buttonText ?? 'Löschen',
      isDestructiveAction: true,
      confirmationRequired: true,
      componentData: {
        deletionKeyWord: options.deletionKeyWord,
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
    this.modalConfirmationService.cancel();

    this.onValidateCallback = undefined;
    this.onSubmitCallback = undefined;

    this.isVisible.set(false);
  }

  private createOverlayComponent(): void {
    this.overlayComponentRef = createComponent(ModalOverlayComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.appRef.attachView(this.overlayComponentRef.hostView);
    document.body.appendChild(this.overlayComponentRef.location.nativeElement);
  }

  private createModalComponent(options: ModalOptions): void {
    const modalInjector = Injector.create({
      parent: this.injector,
      providers: this.resolveProviderMap(options.providerMap),
    });

    this.modalComponentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: modalInjector,
    });
    this.appRef.attachView(this.modalComponentRef.hostView);
    document.body.appendChild(this.modalComponentRef.location.nativeElement);
  }

  private setModalInstanceOptions(options: ModalOptions): void {
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

    if (options.onSubmitCallback) {
      this.onSubmitCallback = options.onSubmitCallback;
    }

    if (options.onValidateCallback) {
      this.onValidateCallback = options.onValidateCallback;
    }
  }
}
