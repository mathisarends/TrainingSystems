import { Component, effect, ElementRef, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { BrowserCheckService } from '../browser-check.service';
import { Subject } from 'rxjs';
import { LoadingService } from '../../service/util/loading.service';

@Component({
  selector: 'app-loading-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './loading-progress-bar.component.html',
  styleUrls: ['./loading-progress-bar.component.scss'], // Corrected to styleUrls
})
export class LoadingProgressBarComponent implements OnInit {
  progress = signal<number>(0);
  isComplete = signal<boolean>(false);
  private loadingComplete$ = new Subject<void>();
  private loadingInterval: any;

  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef; // Reference to the progress bar element

  constructor(
    private browserCheckService: BrowserCheckService,
    private loadingService: LoadingService,
    private injector: Injector,
  ) {}

  ngOnInit() {
    if (this.browserCheckService.isBrowser()) {
      // Reactively listen to changes in the loading state using the computed signal
      effect(
        () => {
          console.log('called when loading state changes:', this.loadingService.isLoading());
          if (this.loadingService.isLoading()) {
            this.isComplete.set(false);
            this.progress.set(0);
            this.showProgressBar();
            this.simulateLoading(); // Start progress animation if loading is active
          } else {
            this.completeLoading(); // Complete progress animation if no loading is active
          }
        },
        { allowSignalWrites: true, injector: this.injector },
      );
    }
  }

  simulateLoading() {
    let progressValue = 0;
    const fastTarget = 60;
    const slowTarget = 90;

    this.loadingInterval = setInterval(() => {
      if (progressValue < fastTarget && !this.isComplete()) {
        console.log(
          '🚀 ~ LoadingProgressBarComponent ~ this.loadingInterval=setInterval ~ progressValue:',
          progressValue,
        );
        const randomIncrement = 2 + Math.random() * 3;
        progressValue += randomIncrement;
        this.progress.set(progressValue);
      } else if (progressValue >= fastTarget && progressValue < slowTarget && !this.isComplete()) {
        const randomFactor = Math.random() * 0.1 + 0.9;
        progressValue += ((slowTarget - progressValue) / 30) * randomFactor;
        this.progress.set(progressValue); // Update the signal value
      } else if (progressValue >= slowTarget || this.isComplete()) {
        clearInterval(this.loadingInterval);
      }
    }, 50);
  }

  completeLoading() {
    clearInterval(this.loadingInterval);
    this.progress.set(100);
    this.isComplete.set(true);
    setTimeout(() => {
      this.hideProgressBar();
    }, 300);
  }

  showProgressBar() {
    const progressBarElement = this.progressBar.nativeElement as HTMLElement;
    progressBarElement.classList.remove('hidden'); // Remove the 'hidden' class to show the progress bar
    progressBarElement.style.display = 'block'; // Ensure the progress bar is visible
  }

  hideProgressBar() {
    const progressBarElement = this.progressBar.nativeElement as HTMLElement;
    progressBarElement.classList.add('hidden');

    setTimeout(() => {
      progressBarElement.style.display = 'none';
    }, 300);
  }

  notifyDataLoaded() {
    this.loadingComplete$.next();
  }
}
