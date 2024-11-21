import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../../core/services/http-client.service';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { InfoComponent } from '../../../../shared/components/info/info.component';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-auto-progression',
  standalone: true,
  imports: [ReactiveFormsModule, InfoComponent, FloatingLabelInputComponent],
  templateUrl: './auto-progression.component.html',
  styleUrl: './auto-progression.component.scss',
})
export class AutoProgressionComponent implements OnConfirm {
  planId = input.required<string>;

  protected rpeProgressionOption = signal(0.5);

  protected isDeloadWeekOptionSelection = signal(true);

  constructor(
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  onConfirm(): void {
    const url = `/training/${this.planId}/auto-progression`;

    const autoProgressionDto = {
      withDeloadWeek: this.isDeloadWeekOptionSelection(),
      rpeProgression: this.rpeProgressionOption(),
    };

    this.httpService.post(url, autoProgressionDto).subscribe(() => this.toastService.success('Progression geplant'));
  }
}
