import {
  Injectable,
  ApplicationRef,
  Injector,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { ModalComponent } from '../app/components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef!: ComponentRef<ModalComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  open(component: any, title: string) 

    // Erstellen Sie die ModalComponent dynamisch
    this.modalComponentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });

    this.appRef.attachView(this.modalComponentRef.hostView);

    const domElem = this.modalComponentRef.location.nativeElement;
    document.body.appendChild(domElem);

    this.modalComponentRef.instance.childComponentType = component;
    this.modalComponentRef.instance.title = title.toUpperCase();
  }

  close() {
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();
  }
}
