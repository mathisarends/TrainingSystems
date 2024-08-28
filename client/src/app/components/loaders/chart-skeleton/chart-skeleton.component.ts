import { Component, input, OnInit, signal } from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton.component';

@Component({
  selector: 'app-chart-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './chart-skeleton.component.html',
  styleUrl: './chart-skeleton.component.scss',
})
export class ChartSkeletonComponent implements OnInit {
  rows = input<number>(10);

  rowsArray = signal<number[]>([]);

  ngOnInit(): void {
    const rowsArray = Array.from({ length: this.rows() }, (_, i) => i);
    this.rowsArray.set(rowsArray);
  }
}
