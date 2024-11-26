import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Injectable()
export class AutoProgressionService {
  rpeProgressionOption = signal(0.5);

  isDeloadWeekOptionSelection = signal(true);

  constructor(
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  confirmAutoProgression(planId: string): Observable<void> {
    const url = `/training/${planId}/auto-progression`;

    const autoProgressionDto = {
      withDeloadWeek: this.isDeloadWeekOptionSelection(),
      rpeProgression: this.rpeProgressionOption(),
    };

    return this.httpService
      .post<void>(url, autoProgressionDto)
      .pipe(tap(() => this.toastService.success('Progression geplant')));
  }
}
