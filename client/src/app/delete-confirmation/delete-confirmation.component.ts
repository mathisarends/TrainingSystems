import { Component } from '@angular/core';

import { AlertComponent } from '../components/alert/alert.component';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [AlertComponent],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss',
})
export class DeleteConfirmationComponent {}
