import { Component, input, Input } from '@angular/core';
import { HttpClientService } from '../../service/http/http-client.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpMethods } from '../types/httpMethods';
import { ToastService } from '../components/toast/toast.service';

@Component({
  selector: 'app-auto-progression',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auto-progression.component.html',
  styleUrl: './auto-progression.component.scss',
})
export class AutoProgressionComponent {
  planId = input.required<string>;

  autoProgressionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpClientService,
    private toastService: ToastService
  ) {
    this.autoProgressionForm = this.fb.group({
      rpeProgression: ['0.5', Validators.required],
      deloadWeek: ['true', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.autoProgressionForm.valid) {
      const { rpeProgression, deloadWeek } = this.autoProgressionForm.value;

      const url = `training/plan/${this.planId}/auto-progression?rpeProgression=${rpeProgression}&deloadWeek=${deloadWeek}`;

      this.httpService.request<any>(HttpMethods.POST, url).subscribe({
        next: () => {
          this.toastService.show('Erfolg', 'Progression geplant');
        },
        error: (error) => {
          console.error('Subscription error:', error);
          if (error.status === 500) {
            this.toastService.show(
              'Fehler',
              'Interner Serverfehler, bitte versuchen Sie es später erneut.'
            );
          }
        },
      });
    }
  }
}
