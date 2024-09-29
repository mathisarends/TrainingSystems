import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input() alertType: string = 'primary';
  @Input() alertText: string = 'This is an alert!';
}
