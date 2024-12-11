import {
  AfterViewInit,
  Component,
  ComponentRef,
  createComponent,
  effect,
  EnvironmentInjector,
  HostBinding,
  HostListener,
  Injector,
  Input,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';
import { BottomSheetService } from './bottom-sheet.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  template: '<ng-template #content></ng-template>\n',
  styleUrls: ['./bottom-sheet.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class BottomSheetComponent implements AfterViewInit {
  bottomSheetContent = viewChild('content', { read: ViewContainerRef });

  @Input() childComponentType: any;
  @Input() childComponentInjector: Injector | null = null;
  childComponentRef!: ComponentRef<any>;

  isVisible = signal(false);

  private clickDisabled = signal(false);

  @HostBinding('@toggleCollapse') get toggleAnimationState(): string {
    return this.isVisible() ? 'expanded' : 'collapsed';
  }

  @HostListener('click', ['$event'])
  onSheetClick(event: MouseEvent): void {
    event.stopImmediatePropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.clickDisabled()) {
      return;
    }

    if (this.isVisible()) {
      this.close();
      this.clickDisabled.set(false);
    }
  }

  constructor(
    private environmentInjector: EnvironmentInjector,
    private bottomSheetService: BottomSheetService,
  ) {
    effect(
      () => {
        if (this.isVisible()) {
          this.disableClicksForDuration(300);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngAfterViewInit(): void {
    if (!this.bottomSheetContent()) {
      return;
    }

    if (!this.childComponentType) {
      return;
    }

    this.childComponentRef = createComponent(this.childComponentType, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.bottomSheetContent()!.injector,
    });

    this.bottomSheetContent()!.insert(this.childComponentRef.hostView);
  }

  open(): void {
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
    this.bottomSheetService.close();
  }

  private disableClicksForDuration(duration: number): void {
    this.clickDisabled.set(true);
    setTimeout(() => {
      this.clickDisabled.set(false);
    }, duration);
  }
}
