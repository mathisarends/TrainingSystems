import {
  AfterViewInit,
  Component,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  HostBinding,
  Injector,
  Input,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { toggleCollapseAnimation } from '../../animations/toggle-collapse';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
  animations: [toggleCollapseAnimation],
})
export class BottomSheetComponent implements AfterViewInit {
  bottomSheetContent = viewChild('content', { read: ViewContainerRef });

  @Input() childComponentType: any;
  @Input() childComponentInjector: Injector | null = null;
  childComponentRef!: ComponentRef<any>;

  isVisible = signal(false);

  @HostBinding('@toggleCollapse') get toggleAnimationState(): string {
    return this.isVisible() ? 'expanded' : 'collapsed';
  }

  constructor(private environmentInjector: EnvironmentInjector) {}

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
  }
}
