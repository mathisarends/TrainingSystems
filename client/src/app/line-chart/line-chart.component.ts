import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Chart, { ActiveElement, ChartEvent } from 'chart.js/auto';
import { ModalService } from '../../service/modal/modalService';
import { DeleteConfirmationComponent } from '../Pages/delete-confirmation/delete-confirmation.component';
import { ModalSize } from '../../service/modal/modalSize';
import { HttpClientService } from '../../service/http/http-client.service';
import { HttpMethods } from '../types/httpMethods';

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

  constructor(
    private modalSerivce: ModalService,
    private httpService: HttpClientService
  ) {}

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
            const dataset = this.chart.data.datasets[datasetIndex];
            const label = this.chart.data.labels![index];
            const value = dataset.data[index];

            // Hier kannst du die Aktion definieren, die ausgeführt werden soll
            console.log(
              `Clicked on point in dataset ${dataset.label} at ${label}: ${value}`
            );

            const id = '42904af2-5e66-442d-b62e-7fa06509100f';
            this.httpService
              .request(
                HttpMethods.GET,
                `training/statistics/${id}/drilldown/${dataset.label}/${0}`
              )
              .subscribe((response) => {
                console.log(
                  '🚀 ~ LineChartComponent ~ this.httpService.request ~ response:',
                  response
                );
              });

            this.modalSerivce.open({
              component: DeleteConfirmationComponent,
              size: ModalSize.LARGE,
              title: 'Drilldown',
              buttonText: 'Abschließen',
              hasFooter: false,
            });
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
