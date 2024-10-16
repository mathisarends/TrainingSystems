import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../../core/services/http-client.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-auto-progression',
  standalone: true,
  imports: [ReactiveFormsModule, AlertComponent, FloatingLabelInputComponent],
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
    const url = `/training/plan/${this.planId}/auto-progression?rpeProgression=${this.rpeProgressionOption()}&deloadWeek=${this.isDeloadWeekOptionSelection()}`;

    this.httpService.post(url).subscribe(() => this.toastService.success('Progression geplant'));
  }
}
