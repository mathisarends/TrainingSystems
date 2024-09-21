import { Component, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../../core/services/http-client.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-auto-progression',
  standalone: true,
  imports: [ReactiveFormsModule, AlertComponent],
  templateUrl: './auto-progression.component.html',
  styleUrl: './auto-progression.component.scss',
})
export class AutoProgressionComponent implements OnConfirm {
  planId = input.required<string>;

  autoProgressionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private toastService: ToastService,
  ) {
    this.autoProgressionForm = this.fb.group({
      rpeProgression: ['0.5', Validators.required],
      deloadWeek: ['true', Validators.required],
    });
  }

  onConfirm(): void {
    if (this.autoProgressionForm.valid) {
      const { rpeProgression, deloadWeek } = this.autoProgressionForm.value;

      const url = `/training/plan/${this.planId}/auto-progression?rpeProgression=${rpeProgression}&deloadWeek=${deloadWeek}`;

      this.httpService.post(url).subscribe({
        next: () => {
          this.toastService.success('Progression geplant');
        },
      });
    }
  }
}
