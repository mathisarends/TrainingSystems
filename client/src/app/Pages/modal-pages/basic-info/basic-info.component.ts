import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss',
})
export class BasicInfoComponent {
  @Input() text: string = '';
}
