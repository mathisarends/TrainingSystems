import { Input, Directive, input } from '@angular/core';

@Directive()
export abstract class BaseIconComponent {
  size = input<number>(18);
}
