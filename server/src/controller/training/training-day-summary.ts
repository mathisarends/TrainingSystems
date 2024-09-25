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

async function renderTonnageChart(trainingData: TrainingDAyFinishedNotification) {
  // Beispiel-Farbpalette
  const colors = [
    '#4caf50', // Grün
    '#2196f3', // Blau
    '#ff9800', // Orange
    '#9c27b0', // Violett
    '#f44336', // Rot
    '#00bcd4' // Türkis
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
  // Rendere den Tonnage-Chart
  const tonnageChartBuffer = await renderTonnageChart(trainingData);

  // Speicher den Chart als Bild
  const tonnageChartPath = path.join(__dirname, 'tonnage-chart.png');
  fs.writeFileSync(tonnageChartPath, tonnageChartBuffer);

  // E-Mail-Inhalt generieren
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
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
            padding: 20px;
          }

          .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .summary-table th, .summary-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
            color: #333333; /* Textfarbe für Zellen festlegen */
          }

          .summary-table th {
            background-color: #f0f0f0;
            color: #333333; /* Textfarbe für Tabellenkopf */
          }

          .text-center {
            text-align: center !important;
          }

          p {
            color: #666666;
          }
          </style>
        </head>
        <body>
          <div class="container">
          <p>Date: <strong>${dateFormatted}</strong></p>
          <p>Time: <strong>${startTimeFormatted} - ${endTimeFormatted}</strong></p>
          <p>Total Duration: <strong>${trainingData.durationInMinutes}</strong> minutes</p>
  
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
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
  
            <p>Total Tonnage: <strong>${trainingData.trainingDayTonnage.toLocaleString()}</strong> kg</p>
  
            <img src="cid:tonnageChart" alt="Tonnage Chart" />
          </div>
        </body>
      </html>
    `;
}
