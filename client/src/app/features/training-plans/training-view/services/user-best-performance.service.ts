import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Injectable()
export class UserBestPerformanceService {
  constructor(private toastService: ToastService) {}

  startConfetti() {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.9 },
      });
    }, 125);

    this.toastService.success('New PR');

    new Audio('./audio/new_pr.mp3').play();
  }
}
