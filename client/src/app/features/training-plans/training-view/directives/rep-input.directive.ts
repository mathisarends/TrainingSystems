import { Directive, HostListener } from '@angular/core';
import { FormService } from '../../../../core/form.service';
import { InteractiveElementDirective } from '../../../../shared/directives/interactive-element.directive';
import { AutoSaveService } from '../../../../shared/service/auto-save.service';
import { EstMaxService } from '../services/estmax.service';

@Directive({
  selector: '[repInputDirective]',
  standalone: true,
})
export class RepInputDirective extends InteractiveElementDirective {
  constructor(
    protected override autoSaveService: AutoSaveService,
    protected override formService: FormService,
    private estMaxService: EstMaxService,
  ) {
    super(autoSaveService, formService);
  }

  @HostListener('change', ['$event'])
  override onChange(event: Event): void {
    super.onChange(event);

    this.estMaxService.calculateMaxAfterInputChange(event.target as HTMLInputElement);
  }
}
