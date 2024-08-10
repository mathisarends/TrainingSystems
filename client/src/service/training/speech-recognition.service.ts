import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;
  private timeoutId: any;
  private readonly TIMEOUT_DURATION = 3000; // Set the timeout duration (in milliseconds)
  private stopListeningSubject: Subject<void> = new Subject<void>();

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (isPlatformBrowser(this.platformId) && !this.recognition) {
      const { webkitSpeechRecognition }: IWindow = <IWindow>(<unknown>window);
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true; // Set to true for continuous recognition
      this.recognition.interimResults = true; // Set to true to get interim results
      this.recognition.lang = 'de-DE'; // Set the language to German (Germany)
    }
  }

  startListening(callback: (transcript: string) => void): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isListening) return;

      this.recognition.onresult = (event: any) => {
        this.zone.run(() => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          callback(interimTranscript || finalTranscript);
          this.resetTimeout(); // Reset the timeout whenever new input is detected
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        clearTimeout(this.timeoutId);
      };

      // Start the timeout when the user starts speaking
      this.recognition.onaudiostart = () => {
        this.resetTimeout(); // Start the timeout when audio starts
      };

      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      clearTimeout(this.timeoutId);
      this.notifyStopListening();
    }
  }

  private resetTimeout(): void {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.stopListening();
    }, this.TIMEOUT_DURATION);
  }

  private notifyStopListening(): void {
    this.stopListeningSubject.next();
  }

  onStopListening(): Observable<void> {
    return this.stopListeningSubject.asObservable();
  }
}

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
