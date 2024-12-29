import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { UserBestPerformanceDto } from '../../shared/service/user-best-performance/user-best-performance.dto';
import { BestPerformanceCategorySectionComponent } from './best-performance-category-section/best-performance-category-section.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-best-performance',
  standalone: true,
  imports: [BestPerformanceCategorySectionComponent, SpinnerComponent],
  templateUrl: './best-performance.component.html',
  styleUrls: ['./best-performance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestPerformanceComponent implements OnInit {
  /**
   * Holds the user's best performance data for the squat exercise.
   */
  squatPerformance = signal<UserBestPerformanceDto | undefined>(undefined);

  /**
   * Holds the user's best performance data for the bench press exercise.
   */
  benchPerformance = signal<UserBestPerformanceDto | undefined>(undefined);

  /**
   * Holds the user's best performance data for the deadlift exercise.
   */
  deadliftPerformance = signal<UserBestPerformanceDto | undefined>(undefined);

  /**
   * Holds the user's best performance data for the overhead press exercise.
   */
  overheadpressPerformance = signal<UserBestPerformanceDto | undefined>(undefined);

  isInitialized = signal(false);

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.fetchUserBestPerformanceData().subscribe((response) => {
      this.squatPerformance.set(response['Squat']);
      this.benchPerformance.set(response['Bench']);
      this.deadliftPerformance.set(response['Deadlift']);
      this.overheadpressPerformance.set(response['Overheadpress']);
      this.isInitialized.set(true);
    });
  }

  private fetchUserBestPerformanceData(): Observable<{ [key: string]: UserBestPerformanceDto }> {
    return this.httpService.get<{ [key: string]: UserBestPerformanceDto }>('/user-best-performance');
  }
}
