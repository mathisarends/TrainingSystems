import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { TrainingDAyFinishedNotification } from '../../../models/collections/user/training-fninished-notifcation';

dotenv.config();

import { fileURLToPath } from 'url';
import transporter from '../../../config/mailerConfig.js';
import { ChartColors } from './chart-colors.js';
import { TrainingSummary } from './training-summary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const width = 600;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function renderTonnageChart(trainingData: TrainingDAyFinishedNotification) {
  const colors = Object.values(ChartColors);

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

export async function sendMailForTrainingDaySummary(trainingSummaryData: TrainingSummary, userEmail: string) {
  const mailConfig = await getEmailConfigForTrainingDaySummary(trainingSummaryData, userEmail);
  return await transporter.sendMail(mailConfig);
}

export async function getEmailConfigForTrainingDaySummary(trainingSummaryData: TrainingSummary, userEmail: string) {
  const tonnageChartBuffer = await renderTonnageChart(trainingSummaryData);

  const tonnageChartPath = path.join(__dirname, 'tonnage-chart.png');
  fs.writeFileSync(tonnageChartPath, tonnageChartBuffer);

  return {
    from: 'trainingsystems@no-reply.com',
    to: userEmail,
    subject: 'Training Summary',
    html: generateTrainingSummaryEmail(trainingSummaryData),
    attachments: [
      {
        filename: 'tonnage-chart.png',
        path: tonnageChartPath,
        cid: 'tonnageChart'
      }
    ]
  };
}

// Function to generate the HTML email content
export function generateTrainingSummaryEmail(trainingSummaryData: TrainingSummary) {
  const dateFormatted = formatDate(trainingSummaryData.startTime!);
  const startTimeFormatted = formatTime(trainingSummaryData.startTime!);
  const endTimeFormatted = formatTime(trainingSummaryData.endTime!);

  const exerciseRows = trainingSummaryData.exercises
    .map(
      exercise => `
      <tr>
        <td data-cell="Exercise"><div class="label">Exercise</div>${exercise.exercise}</td>
        <td data-cell="Category"><div class="label">Category</div>${exercise.category}</td>
        <td class="text-center" data-cell="Sets"><div class="label">Sets</div>${exercise.sets}</td>
        <td class="text-center" data-cell="Reps"><div class="label">Reps</div>${exercise.reps}</td>
        <td class="text-center" data-cell="Weight"><div class="label">Weight</div>${exercise.weight}</td>
        <td class="text-center" data-cell="Target RPE"><div class="label">Target RPE</div>${exercise.targetRPE}</td>
        <td class="text-center" data-cell="Actual RPE"><div class="label">Actual RPE</div>${exercise.actualRPE}</td>
        <td class="text-center" data-cell="Est Max"><div class="label">Est. Max</div>${exercise.estMax ?? ''}</td>
      </tr>
    `
    )
    .join('');

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
              background-color: #ffffff;
              color: #333333;
              padding: 1.5em;
            }

            .container {
              border-radius: 8px;
              max-width: 800px;
            }

            .headline-container {
              margin-bottom: 0.5rem;
            }

            /* Styles for headlines */
            .context-headline,
            .headline {
              font-size: 1.65rem;
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
              color: #333;
            }

            .summary-table th,
            .summary-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }

            .summary-table th {
              background-color: #f9f9f9;
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

                        
            .summary-table .label {
                display: none;
              }

            /* Responsive table with grid layout for smaller screens */
            @media (max-width: 768px) {
              .summary-table {
                display: block;
                border: none;
              }

              .summary-table thead {
                display: none;
              }

              .summary-table tbody {
                display: grid;
                grid-template-columns: 1fr;
                grid-row-gap: 15px;
              }

              .summary-table tr {
                display: grid;
                grid-template-columns: 1fr;
                background-color: #fefefe;
                padding: 10px;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
              }

              .summary-table .label {
                content: attr(data-cell);
                font-weight: bold;
                text-transform: uppercase;
                color: #666;
                display: block;
                margin-bottom: 5px;
              }

              .text-center {
                text-align: left !important;
              }

              .summary-table td {
                padding: 10px;
                text-align: left;
              }
            }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="headline-container">
            <span class="context-headline">W${trainingSummaryData.trainingDayWeekNumber}D${trainingSummaryData.trainingDayDayNumber}</span>
            <span class="headline">${trainingSummaryData.trainingPlanTitle}</span>
          </div>
          <div class="time-data-container">
            <p>${dateFormatted}</p>
            <p>Zeitraum: ${startTimeFormatted} - ${endTimeFormatted} (${trainingSummaryData.durationInMinutes} Minuten)</p>
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
              ${exerciseRows}
            </tbody>
          </table>
          <p class="total-tonnage">Total Tonnage: <strong>${trainingSummaryData.trainingDayTonnage.toLocaleString()}</strong> kg</p>
          <img src="cid:tonnageChart" alt="Tonnage Chart" class="tonnage-chart" />
          <div class="footer">
            <a class="neutral-link" href="https://trainingsystemsre.onrender.com/profile?openSettings=true">Unsubscribe from Email Notifications</a>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Helper function to format dates and times
function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(time: Date): string {
  return time.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
