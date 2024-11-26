import { OnDestroy } from '@angular/core';

export interface Validatable extends OnDestroy {
  validate(): void;

  ngOnDestroy(): void;
}
