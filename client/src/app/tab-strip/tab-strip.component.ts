import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-strip',
  standalone: true,
  imports: [],
  templateUrl: './tab-strip.component.html',
  styleUrl: './tab-strip.component.scss',
})
export class TabStripComponent {
  @Input() tabs: { title: string; active?: boolean }[] = [];

  setActiveTab(index: number) {
    this.tabs.forEach((tab, i) => (tab.active = i === index));
  }
}
