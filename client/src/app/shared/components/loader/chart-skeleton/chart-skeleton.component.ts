import { Component, effect, Injector, input, OnInit, signal } from '@angular/core';
import { SkeletonComponent } from '../../skeleton/skeleton.component';

/**
 * Component that dynamically generates  a skeleton loading UI for a chart.
 */
@Component({
  selector: 'app-chart-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './chart-skeleton.component.html',
  styleUrl: './chart-skeleton.component.scss',
})
export class ChartSkeletonComponent implements OnInit {
  /**
   * Input property that specifies the number of rows for the skeleton component.
   * Default value is set to 10.
   */
  rows = input<number>(10);

  /**
   * Signal to store an array representing the rows for the skeleton.
   * This array is used to dynamically render the skeleton rows in the template.
   */
  rowsArray = signal<number[]>([]);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    effect(
      () => {
        const rowsArray = Array.from({ length: this.rows() }, (_, i) => i);
        console.log('🚀 ~ ChartSkeletonComponent ~ ngOnInit ~ rowsArray:', rowsArray);
        this.rowsArray.set(rowsArray);
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }
}
