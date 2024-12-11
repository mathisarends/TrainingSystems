import { Component, OnDestroy } from '@angular/core';
import { BottomSheetService } from './bottom-sheet.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="bottom-sheet">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent implements OnDestroy {
  constructor(private bottomSheetService: BottomSheetService) {}

  close(): void {
    this.bottomSheetService.close();
  }

  ngOnDestroy(): void {}
}
