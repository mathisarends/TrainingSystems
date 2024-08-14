import { Component, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { SpeechRecognitionService } from '../../service/training/speech-recognition.service';
import { AlertComponent } from '../components/alert/alert.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Exercise } from '../Pages/training-view/training-exercise';

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
  imports: [AlertComponent, CommonModule],
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss'],
})
export class SpeechToTextComponent implements OnInit {
  isListening = signal<boolean>(false);
  transcript: string = '';
  trainingSet: TrainingSet = {};

  @Input() exercises: Exercise[] = [];
  @Input() profilePictureUrl = '';

  constructor(
    private speechRecognitionService: SpeechRecognitionService,
    private destroyRef: DestroyRef,
  ) {}

  isTrainingSetEmpty(obj: TrainingSet): boolean {
    return Object.keys(obj).length === 0;
  }

  ngOnInit(): void {
    this.speechRecognitionService
      .onStopListening()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isListening.set(false);
        this.extractTrainingSet(this.transcript);
      });

    this.startListening();
  }

  toggleListening() {
    if (this.isListening()) {
      this.isListening.set(false);
      this.extractTrainingSet(this.transcript);
      this.transcript = '';
    } else {
      this.transcript = '';
      this.isListening.set(true);
      this.startListening();
    }
  }

  startListening(): void {
    this.isListening.set(true);
    this.speechRecognitionService.startListening((transcript) => {
      this.transcript = transcript;
    });
  }

  extractTrainingSet(transcript: string): void {
    const transcriptLowerCase = transcript.toLowerCase();
    const trainingSet: TrainingSet = {};

    const weightMatch = transcriptLowerCase.match(/(\d+)\s*kg/);
    if (weightMatch) {
      trainingSet.weight = parseInt(weightMatch[1], 10);
      console.log('gewicht wurde benannt:', trainingSet.weight);
    }

    const repetitionsMatch = transcriptLowerCase.match(/(\d+)\s*wiederholungen/);
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

    const setSchemaMatch = transcriptLowerCase.match(/(\d+)\s*[x*]\s*(\d+)/);
    if (setSchemaMatch) {
      trainingSet.sets = parseInt(setSchemaMatch[1], 10);
      trainingSet.reps = parseInt(setSchemaMatch[2], 10);
      console.log('Satzschema benannt:', trainingSet.sets, 'Sätze mit', trainingSet.reps, 'Wiederholungen');
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
    if (sets) {
      formattedSet += `Sätze: ${sets}\n`;
    }
    if (reps) {
      formattedSet += `Wiederholungen: ${reps}\n`;
    }
    if (rpe) {
      formattedSet += `RPE: ${rpe}\n`;
    }

    return formattedSet.trim(); // This will remove the last \n if present
  }
}
