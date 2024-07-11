import {
  Injectable,
  ApplicationRef,
  Injector,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { ModalComponent } from '../app/components/modal/modal.component';
import { ModalOverlayComponent } from '../app/components/modal-overlay/modal-overlay.component';

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

  open(component: any, title: string, buttonText: string, componentData?: any) {
    console.log('test 1');

    // Create the overlay component
    this.overlayComponentRef = createComponent(ModalOverlayComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.appRef.attachView(this.overlayComponentRef.hostView);
    document.body.appendChild(this.overlayComponentRef.location.nativeElement);

    // Create the ModalComponent dynamically
    this.modalComponentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.appRef.attachView(this.modalComponentRef.hostView);
    document.body.appendChild(this.modalComponentRef.location.nativeElement);

    this.modalComponentRef.instance.childComponentType = component;
    this.modalComponentRef.instance.title = title;
    this.modalComponentRef.instance.confirmButtonText = buttonText;

    // Pass data to the child component
    if (componentData) {
      this.modalComponentRef.instance.childComponentData = componentData;
      console.log('Component Data:', componentData);
    } else {
      console.error('Child component data is not available.');
    }
  }

  close() {
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();

    this.appRef.detachView(this.overlayComponentRef.hostView);
    this.overlayComponentRef.destroy();
  }
}
