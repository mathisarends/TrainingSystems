import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1.75rem';
  @Input() borderRadius: string = '4px';
  @Input() backgroundColor: string = '#e0e0e0';
}
