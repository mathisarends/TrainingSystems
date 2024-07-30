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

  ngOnInit(): void {
    this.createLineChart();
    this.createLineChartFancy();
  }

  /* Den hier für Tonnage verwenden */
  createBarChart() {
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart('MyBarChart', {
      type: 'bar', // Typ des Diagramms
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
            label: 'Tonnage',
            data: [300, 350, 320, 400, 370, 450], // Tonnage-Daten mit Schwankungen über 6 Wochen
            backgroundColor: 'rgba(0, 0, 255, 0.5)', // Hintergrundfarbe mit Transparenz
            borderColor: 'blue', // Randfarbe
            borderWidth: 1, // Breite des Randes
          },
        ],
      },
      options: {
        responsive: true, // Responsiveness aktivieren
        maintainAspectRatio: false, // Seitenverhältnis nicht beibehalten
        scales: {
          x: {
            title: {
              display: true,
              text: 'Wochen',
            },
          },
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
                return 'Tonnage: ' + context.parsed.y + ' kg';
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
      type: 'line', //this denotes the type of chart
      data: {
        // values on X-Axis
        labels: [
          '2022-05-10',
          '2022-05-11',
          '2022-05-12',
          '2022-05-13',
          '2022-05-14',
          '2022-05-15',
          '2022-05-16',
          '2022-05-17',
        ],
        datasets: [
          {
            label: 'Sales',
            data: ['467', '576', '572', '79', '92', '574', '573', '576'],
            backgroundColor: 'blue',
          },
          {
            label: 'Profit',
            data: ['542', '542', '536', '327', '17', '0.00', '538', '541'],
            backgroundColor: 'limegreen',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
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
            fill: true, // Fläche unter der Linie füllen
          },
          {
            label: 'Bench',
            data: [200, 250, 220, 300, 270, 350], // Tonnage-Daten für Bench über 6 Wochen
            borderColor: 'rgba(54, 162, 235, 1)', // Randfarbe
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
          {
            label: 'Deadlift',
            data: [400, 450, 420, 500, 470, 550], // Tonnage-Daten für Deadlift über 6 Wochen
            borderColor: 'rgba(75, 192, 192, 1)', // Randfarbe
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Hintergrundfarbe mit Transparenz
            fill: true, // Fläche unter der Linie füllen
          },
        ],
      },
      options: {
        responsive: true, // Responsiveness aktivieren
        maintainAspectRatio: false, // Seitenverhältnis nicht beibehalten
        scales: {
          x: {
            title: {
              display: true,
              text: 'Wochen',
            },
          },
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
}
