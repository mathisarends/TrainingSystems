import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
} from '@angular/core';
import { BottomSheetComponent } from './bottom-sheet.component';
import { BottomSheetOverlayComponent } from './bottom-sheet-overlay/bottom-sheet-overlay.component';

@Injectable({
  providedIn: 'root',
})
export class BottomSheetService {
  private bottomSheetRef!: ComponentRef<BottomSheetComponent>;
  private overlayComponentRef!: ComponentRef<BottomSheetOverlayComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
  ) {}

  open(component: any): void {
    this.createOverlayComponent();

    const modalInjector = Injector.create({
      parent: this.injector,
      providers: [],
    });

    this.bottomSheetRef = createComponent(BottomSheetComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: modalInjector,
    });

    this.bottomSheetRef.instance.childComponentType = component;
    this.bottomSheetRef.instance.childComponentInjector = modalInjector;

    this.appRef.attachView(this.bottomSheetRef.hostView);
    document.body.appendChild(this.bottomSheetRef.location.nativeElement);

    this.bottomSheetRef.instance.open();
  }

  close(): void {
    if (this.bottomSheetRef) {
      this.bottomSheetRef.instance.close();
      this.appRef.detachView(this.bottomSheetRef.hostView);
      this.bottomSheetRef.destroy();
    }

    if (this.overlayComponentRef) {
      this.appRef.detachView(this.overlayComponentRef.hostView);
      this.overlayComponentRef.destroy();
    }
  }

  private createOverlayComponent(): void {
    this.overlayComponentRef = createComponent(BottomSheetOverlayComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.appRef.attachView(this.overlayComponentRef.hostView);
    document.body.appendChild(this.overlayComponentRef.location.nativeElement);
  }
}
