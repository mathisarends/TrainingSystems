import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LowerCaseReplacePipe } from '../../pipe/lower-case-replace.pipe';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [LowerCaseReplacePipe],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
  @Input() label: string = '';
  @Input() checked: boolean = false;

  @Output() checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  toggleChecked() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
