import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tab-strip',
  standalone: true,
  imports: [],
  templateUrl: './tab-strip.component.html',
  styleUrl: './tab-strip.component.scss',
})
export class TabStripComponent {
  @Input() tabs: { title: string; active?: boolean }[] = [];
  @Output() tabSelected = new EventEmitter<string>();

  selectTab(selectedTab: { title: string }) {
    this.tabs.forEach((tab) => (tab.active = tab.title === selectedTab.title));
    this.tabSelected.emit(selectedTab.title);
  }
}
