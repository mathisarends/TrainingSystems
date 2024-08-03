import { Component, DestroyRef, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../../service/training/speech-recognition.service';
import { AlertComponent } from '../components/alert/alert.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TrainingSet {
  weight?: number;
  reps?: number;
  sets?: number;
  rpe?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-speech-to-text',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss'],
})
export class SpeechToTextComponent implements OnInit {
  isListening: boolean = false;
  transcript: string = '';
  trainingSet: TrainingSet = {};

  constructor(
    private speechRecognitionService: SpeechRecognitionService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.speechRecognitionService
      .onStopListening()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isListening = false;
        this.extractTrainingSet(this.transcript);
      });

    this.startListening();
  }

  toggleListening(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    this.isListening = true;
    this.speechRecognitionService.startListening((transcript) => {
      this.transcript = transcript;
    });
  }

  stopListening(): void {
    this.isListening = false;
    this.speechRecognitionService.stopListening();
  }

  extractTrainingSet(transcript: string): void {
    const transcriptLowerCase = transcript.toLowerCase();
    const trainingSet: TrainingSet = {};

    const weightMatch = transcriptLowerCase.match(/(\d+)\s*kg/);
    if (weightMatch) {
      trainingSet.weight = parseInt(weightMatch[1], 10);
      console.log('gewicht wurde benannt:', trainingSet.weight);
    }

    const repetitionsMatch = transcriptLowerCase.match(
      /(\d+)\s*wiederholungen/
    );
    if (repetitionsMatch) {
      trainingSet.reps = parseInt(repetitionsMatch[1], 10);
      console.log('wiederholungen wurden benannt:', trainingSet.reps);
    }

    const setsMatch = transcriptLowerCase.match(/(\d+)\s*sätze/);
    if (setsMatch) {
      trainingSet.sets = parseInt(setsMatch[1], 10);
      console.log('sätze wurden benannt:', trainingSet.sets);
    }

    const rpeMatch = transcriptLowerCase.match(/(?:rpe|i|rp|api)\s*(\d+)/);
    if (rpeMatch) {
      trainingSet.rpe = parseInt(rpeMatch[1], 10);
      console.log('RPE wurde benannt:', trainingSet.rpe);
    }

    const setSchemaMatch = transcriptLowerCase.match(/(\d+)\s*x\s*(\d+)/);
    if (setSchemaMatch) {
      trainingSet.sets = parseInt(setSchemaMatch[1], 10);
      trainingSet.reps = parseInt(setSchemaMatch[2], 10);
      console.log(
        'Satzschema benannt:',
        trainingSet.sets,
        'Sätze mit',
        trainingSet.reps,
        'Wiederholungen'
      );

      this.trainingSet = trainingSet;
    }

    this.trainingSet = trainingSet;
    console.log('Extrahiertes TrainingSet:', this.trainingSet);
  }

  getFormattedTrainingSet(): string {
    const { weight, reps, sets, rpe } = this.trainingSet;
    let formattedSet = '';

    if (weight) {
      formattedSet += `Gewicht: ${weight} kg\n`;
    }
    if (reps) {
      formattedSet += `Wiederholungen: ${reps}\n`;
    }
    if (sets) {
      formattedSet += `Sätze: ${sets}\n`;
    }
    if (rpe) {
      formattedSet += `RPE: ${rpe}\n`;
    }

    return formattedSet.trim();
  }
}