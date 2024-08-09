import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  items = [
    {
      title: 'Collapsible Group Item #1',
      content: 'Content for item #1',
      isOpen: false,
    },
  ];

  // Toggle the visibility of an item's content
  toggleItem(index: number): void {
    console.log('🚀 ~ AccordionComponent ~ toggleItem ~ index:', index);
    this.items[index].isOpen = !this.items[index].isOpen;
  }
}
