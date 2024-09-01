import { Directive, input } from '@angular/core';

@Directive()
export abstract class BaseIconComponent {
  size = input<number>(18);

  color = input<string>('currentColor');
}
