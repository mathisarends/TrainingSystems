// icon.component.ts
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

  get iconSvg(): string {
    return this.getIconSvg(this.name());
  }

  private getIconSvg(name: string): string {
    const icons: Record<string, string> = {
      bell: `
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      `,
      // Hier weitere Icons hinzufügen, falls benötigt
    };

    return icons[name] || '';
  }
}
