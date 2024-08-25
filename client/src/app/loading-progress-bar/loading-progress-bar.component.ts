import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { BrowserCheckService } from '../browser-check.service';
import { Subject } from 'rxjs';

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

  constructor(private browserCheckService: BrowserCheckService) {}

  ngOnInit() {
    if (this.browserCheckService.isBrowser()) {
      this.simulateLoading();

      // Automatically fire the loading complete event after 2 seconds for testing
      setTimeout(() => {
        this.notifyDataLoaded();
      }, 2000);

      // Subscribe to the loading complete event
      this.loadingComplete$.subscribe(() => {
        this.completeLoading();
      });
    }
  }

  simulateLoading() {
    let progressValue = 0;
    const fastTarget = 60;
    const slowTarget = 90;

    this.loadingInterval = setInterval(() => {
      if (progressValue < fastTarget && !this.isComplete()) {
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
