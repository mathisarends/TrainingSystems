import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  public barChart: any;
  public lineChart: any;
  public fancyLineChart: any;
  pieChart: any;

  ngOnInit(): void {
    this.createLineChart();
    this.createLineChartFancy();
    this.createPieChart();
  }

  createLineChart() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart('MyLineChart', {
      type: 'line', // Typ des Diagramms
      data: {
        // Werte auf der X-Achse
        labels: [
          'Woche 1',
          'Woche 2',
          'Woche 3',
          'Woche 4',
          'Woche 5',
          'Woche 6',
        ],
        datasets: [
          {
            label: 'Squat',
            data: [300, 350, 320, 400, 370, 450], // Tonnage-Daten für Squat über 6 Wochen
            borderColor: 'rgba(255, 99, 132, 1)', // Randfarbe
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: false, // Fläche unter der Linie füllen
          },
          {
            label: 'Bench',
            data: [200, 250, 220, 300, 270, 350], // Tonnage-Daten für Bench über 6 Wochen
            borderColor: 'rgba(54, 162, 235, 1)', // Randfarbe
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: false, // Fläche unter der Linie füllen
          },
          {
            label: 'Deadlift',
            data: [400, 450, 420, 500, 470, 550], // Tonnage-Daten für Deadlift über 6 Wochen
            borderColor: 'rgba(75, 192, 192, 1)', // Randfarbe
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: false, // Fläche unter der Linie füllen
          },
        ],
      },
      options: {
        responsive: true, // Responsiveness aktivieren
        maintainAspectRatio: false, // Seitenverhältnis nicht beibehalten
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tonnage (kg)',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + ' kg';
              },
            },
          },
        },
      },
    });
  }

  createLineChartFancy() {
    if (this.fancyLineChart) {
      this.fancyLineChart.destroy();
    }

    this.fancyLineChart = new Chart('MyFancyLineChart', {
      type: 'line', // Typ des Diagramms
      data: {
        // Werte auf der X-Achse
        labels: [
          'Woche 1',
          'Woche 2',
          'Woche 3',
          'Woche 4',
          'Woche 5',
          'Woche 6',
        ],
        datasets: [
          {
            label: 'Squat',
            data: [300, 320, 330, 350, 370, 390], // Bestleistungen für Squat über 6 Wochen
            borderColor: 'rgba(255, 99, 132, 1)', // Randfarbe
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
          {
            label: 'Bench',
            data: [200, 220, 210, 230, 240, 250], // Bestleistungen für Bench über 6 Wochen
            borderColor: 'rgba(54, 162, 235, 1)', // Randfarbe
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
          {
            label: 'Deadlift',
            data: [400, 420, 410, 450, 460, 480], // Bestleistungen für Deadlift über 6 Wochen
            borderColor: 'rgba(75, 192, 192, 1)', // Randfarbe
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
          {
            label: 'Overall Performance',
            data: [900, 960, 950, 1030, 1070, 1120], // Gesamte Bestleistungen über 6 Wochen
            borderColor: 'rgba(153, 102, 255, 1)', // Randfarbe
            backgroundColor: 'rgba(153, 102, 255, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
        ],
      },
      options: {
        responsive: true, // Responsiveness aktivieren
        maintainAspectRatio: false, // Seitenverhältnis nicht beibehalten
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Bestleistung in KG',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + ' kg';
              },
            },
          },
        },
      },
    });
  }

  createPieChart() {
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart('MyPieChart', {
      type: 'pie',
      data: {
        labels: ['Squat', 'Bench', 'Deadlift'],
        datasets: [
          {
            data: [300, 200, 400], // Beispielwerte für die Gesamttonnage
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.raw + ' kg';
              },
            },
          },
        },
      },
    });
  }
}
