import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { BottomSheetOverlayComponent } from './bottom-sheet-overlay/bottom-sheet-overlay.component';

@Injectable({
  providedIn: 'root',
})
export class BottomSheetService {
  private bottomSheetRef: ComponentRef<any> | null = null;
  private overlayComponentRef!: ComponentRef<BottomSheetOverlayComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private environmentInjector: EnvironmentInjector,
  ) {}

  open(component: any, data?: any, viewContainerRef?: ViewContainerRef): void {
    this.createOverlayComponent();

    if (this.bottomSheetRef) {
      this.close();
    }

    if (!viewContainerRef) {
      throw new Error('A ViewContainerRef must be provided.');
    }

    this.bottomSheetRef = viewContainerRef.createComponent(component, {
      injector: this.injector,
      environmentInjector: this.envInjector,
    });

    if (data) {
      Object.assign(this.bottomSheetRef.instance, data);
    }

    this.appRef.attachView(this.bottomSheetRef.hostView);

    document.body.classList.add('bottom-sheet-open');
  }

  close(): void {
    if (this.bottomSheetRef) {
      this.appRef.detachView(this.bottomSheetRef.hostView);
      this.bottomSheetRef.destroy();
      this.bottomSheetRef = null;

      document.body.classList.remove('bottom-sheet-open');
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
