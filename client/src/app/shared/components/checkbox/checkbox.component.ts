import { Component, effect, HostListener, Injector, input, OnInit, output, signal } from '@angular/core';
import { CheckboxItem } from './checkbox-item';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent implements OnInit {
  item = input<CheckboxItem>();

  label = signal('');

  checked = signal(false);

  valueChanged = output<CheckboxItem>();

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    effect(
      () => {
        const item = this.item();
        if (item) {
          this.label.set(item.label);
          this.checked.set(item.isChecked);
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  toggleCheckbox() {
    const newValue = !this.checked();
    this.checked.set(newValue);
    this.valueChanged.emit({
      label: this.label(),
      isChecked: newValue,
    });
  }

  @HostListener('click')
  onHostClick() {
    this.toggleCheckbox();
  }
}
