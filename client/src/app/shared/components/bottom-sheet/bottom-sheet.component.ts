import { Component, Injector, Input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent {
  bottomSheetComponent = viewChild('bottomSheetComponent');

  @Input() childComponentType: any;
  @Input() childComponentInjector: Injector | null = null;

  isVisible = signal(false);

  open(): void {
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
  }
}
