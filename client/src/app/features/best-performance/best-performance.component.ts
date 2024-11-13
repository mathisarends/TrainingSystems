import { JsonPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpService } from '../../core/services/http-client.service';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { ChartSkeletonComponent } from '../../shared/components/loader/chart-skeleton/chart-skeleton.component';
import { MapPropertyPipe } from '../../shared/pipes/map-property.pipe';
import { ExerciseName } from '../../shared/service/user-best-performance/exercise-name.type';
import { UserBestPerformanceDto } from '../../shared/service/user-best-performance/user-best-performance.dto';

@Component({
  selector: 'app-best-performance',
  standalone: true,
  imports: [DashboardCardComponent, ChartSkeletonComponent, JsonPipe, MapPropertyPipe],
  templateUrl: './best-performance.component.html',
  styleUrls: ['./best-performance.component.scss'],
  providers: [],
})
export class BestPerformanceComponent implements OnInit {
  userBestPerformanceMap: Map<ExerciseName, UserBestPerformanceDto> = new Map();
  isInitialized = signal(false);

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.fetchUserBestPerformanceData().subscribe((response) => {
      this.userBestPerformanceMap = new Map<ExerciseName, UserBestPerformanceDto>(
        Object.entries(response) as [string, UserBestPerformanceDto][],
      );
      this.isInitialized.set(true);
    });
  }

  private fetchUserBestPerformanceData(): Observable<{ [key: string]: UserBestPerformanceDto }> {
    return this.httpService.get<{ [key: string]: UserBestPerformanceDto }>('/user-best-performance');
  }
}
