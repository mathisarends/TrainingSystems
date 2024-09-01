import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent {
  name = input.required<string>();
  size = input<number>(18);
  color = input<string>('currentColor');
  fillIcon = input<boolean>(false);
}
