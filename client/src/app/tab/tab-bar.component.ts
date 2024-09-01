import { Component, input, OnInit, output, signal } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss',
})
export class TabBarComponent implements OnInit {
  /**
   * An array of strings representing the tab labels to be displayed.
   */
  tabs = input.required<string[]>();

  /**
   * A signal representing the currently active tab.
   */
  activeTab = signal<string>('');

  /**
   * An output event that emits the label of the currently selected tab.
   */
  tabChange = output<string>();

  ngOnInit(): void {
    if (this.tabs.length > 0) {
      this.activeTab.set(this.tabs()[0]);
    }
  }

  /**
   * Changes the currently selected tab and emits the change event.
   * @param tab - The label of the tab to select.
   */
  protected changeTab(tab: string) {
    console.log('🚀 ~ TabBarComponent ~ changeTab ~ tab:', tab);
    this.tabChange.emit(tab);
  }
}
