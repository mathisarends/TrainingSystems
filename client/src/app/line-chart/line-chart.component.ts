import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Chart, { ActiveElement, ChartEvent } from 'chart.js/auto';
import { ExerciseDrillThroughEvent } from './exercise-drill-through-event';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvas!: ElementRef;

  @Input() chartId: string = 'lineChart';
  @Input() data: any[] = [];
  @Input() labels: string[] = [];
  @Input() yAxisTitle: string = 'Value';
  @Input() maintainAspectRatio: boolean = false;

  @Output() drillThrough = new EventEmitter<ExerciseDrillThroughEvent>();

  chart!: Chart<'line'>;

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🚀 ~ LineChartComponent ~ ngOnChanges ~ changes:', changes);
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  initializeChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    this.chart = new Chart(context, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.data,
      },
      options: {
        responsive: true,
        maintainAspectRatio: this.maintainAspectRatio,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.yAxisTitle,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return context.dataset.label
                  ? `${context.dataset.label}: ${
                      context.parsed.y || context.raw
                    } kg`
                  : `${context.label}: ${context.raw} kg`;
              },
            },
          },
        },
        onClick: (event: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            const exercise = this.chart.data.datasets[datasetIndex]
              .label as string;
            const label = this.chart.data.labels![index] as string;

            // Extract the week number from the label (assuming the label format is "Woche X")
            const weekNumber = parseInt(label.match(/\d+/)?.[0] || '0', 10);

            this.drillThrough.emit({ exerciseName: exercise, weekNumber });
          }
        },
      },
    });
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = this.data;
      this.chart.update();
    }
  }
}
