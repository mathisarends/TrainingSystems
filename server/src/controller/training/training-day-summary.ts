import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { TrainingDAyFinishedNotification } from '../../models/collections/user/training-fninished-notifcation';

import { ChartConfiguration } from 'chart.js';

dotenv.config();

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const width = 600;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

enum ChartColors {
  Green = '#4caf50',
  Blue = '#2196f3',
  Orange = '#ff9800',
  Purple = '#9c27b0',
  Red = '#f44336',
  Teal = '#00bcd4'
}

async function renderTonnageChart(trainingData: TrainingDAyFinishedNotification) {
  const colors = [
    ChartColors.Green,
    ChartColors.Blue,
    ChartColors.Orange,
    ChartColors.Purple,
    ChartColors.Red,
    ChartColors.Teal
  ];

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: trainingData.exercises.map(ex => ex.exercise),
      datasets: [
        {
          label: 'Tonnage (kg)',
          data: trainingData.exercises.map(ex => parseInt(ex.weight) * ex.reps * ex.sets),
          backgroundColor: trainingData.exercises.map((_, index) => colors[index % colors.length])
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(config);
}

// E-Mail versenden
export async function getEmailConfigForTrainingDaySummary(
  trainingData: TrainingDAyFinishedNotification,
  userEmail: string
) {
  const tonnageChartBuffer = await renderTonnageChart(trainingData);

  const tonnageChartPath = path.join(__dirname, 'tonnage-chart.png');
  fs.writeFileSync(tonnageChartPath, tonnageChartBuffer);

  return {
    from: 'trainingsystems@no-reply.com',
    to: userEmail,
    subject: 'Training Summary',
    html: generateTrainingSummaryEmail(trainingData),
    attachments: [
      {
        filename: 'tonnage-chart.png',
        path: tonnageChartPath,
        cid: 'tonnageChart'
      }
    ]
  };
}

function generateTrainingSummaryEmail(trainingData: TrainingDAyFinishedNotification) {
  const dateFormatted = trainingData.startTime!.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Start- und Endzeit formatieren: 17:45-19:00
  const startTimeFormatted = trainingData.startTime!.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const endTimeFormatted = trainingData.endTime!.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Training Summary</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              background-color: #f5f5f5;
              color: #333333;
              padding: 20px;
              padding-left: 0;
            }

            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
              max-width: 800px;
              margin: 0 auto;
            }

            .headline-container {
              margin-bottom: 0.5rem;
            }

            /* Stile für die Headlines */
            .context-headline,
            .headline {
              font-size: 1.75rem;
              font-weight: bold;
              text-transform: uppercase;
            }

            .context-headline {
              color: #adadad;
            }

            .headline {
              margin-left: 0.375rem;
              color: #333;
            }

            .time-data-container {
              margin-bottom: 1.25rem;
              color: #666;
            }

            .time-data-container p {
              margin: 0;
              margin-bottom: 0.3em;
            }

            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              border-radius: 5px;
              overflow: hidden;
            }

            .summary-table th,
            .summary-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }

            .summary-table th {
              background-color: #f9f9f9;
              color: #333;
              font-size: 1rem;
            }

            .summary-table td {
              background-color: #fefefe;
              font-size: 0.95rem;
            }

            .summary-table tr:hover {
              background-color: #f1f1f1;
            }

            .text-center {
              text-align: center !important;
            }

            p {
              color: #666666;
              font-size: 1rem;
            }

            .total-tonnage {
              background-color: #f0f8ff;
              padding: 12px;
              font-weight: bold;
              font-size: 1.15rem;
              color: #333;
            }

            .tonnage-chart {
              display: block;
              margin: 30px auto;
              width: 100%;
              max-width: 500px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .footer {
              text-align: center;
              color: #999999;
              font-size: 12px;
              margin-top: 30px;
            }

            .neutral-link {
              color: #333;
              font-size: 0.85rem;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="headline-container">
              <span>
                <span class="context-headline">W2D3</span>
                <span class="headline">Trainingsplan</span>
              </span>
            </div>

            <div class="time-data-container">
              <p>${dateFormatted}</p>
              <p>Zeitraum: ${startTimeFormatted} - ${endTimeFormatted} (${trainingData.durationInMinutes} Minuten)</p>
            </div>

            <table class="summary-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Category</th>
                  <th class="text-center">Sets</th>
                  <th class="text-center">Reps</th>
                  <th class="text-center">Weight</th>
                  <th class="text-center">Target RPE</th>
                  <th class="text-center">Actual RPE</th>
                  <th class="text-center">Est Max</th>
                </tr>
              </thead>
              <tbody>
                ${trainingData.exercises
                  .map(
                    exercise => `
                      <tr>
                        <td>${exercise.exercise}</td>
                        <td>${exercise.category}</td>
                        <td class="text-center">${exercise.sets}</td>
                        <td class="text-center">${exercise.reps}</td>
                        <td class="text-center">${exercise.weight}</td>
                        <td class="text-center">${exercise.targetRPE}</td>
                        <td class="text-center">${exercise.actualRPE}</td>
                        <td class="text-center">${exercise.estMax !== undefined && exercise.estMax !== null ? exercise.estMax : ''}</td>
                      </tr>`
                  )
                  .join('')}
              </tbody>
            </table>

            <p class="total-tonnage">Total Tonnage: <strong>${trainingData.trainingDayTonnage.toLocaleString()}</strong> kg</p>

            <img src="cid:tonnageChart" alt="Tonnage Chart" class="tonnage-chart" />

            <div class="footer">
              <a class="neutral-link" href="https://trainingsystemsre.onrender.com/unsubscribe">Unsubscribe from Email Notifications</a>
            </div>
          </div>
        </body>
      </html>
    `;
}
