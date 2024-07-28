import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../../service/training/speech-recognition.service';
import { AlertComponent } from '../components/alert/alert.component';

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

  constructor(private speechRecognitionService: SpeechRecognitionService) {}

  ngOnInit(): void {}

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
}
