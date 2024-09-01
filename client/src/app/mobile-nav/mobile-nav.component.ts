import { Component } from '@angular/core';
import { ZapIconComponent } from '../components/icon/zap-icon/zap-icon.component';
import { BellIconComponent } from '../components/icon/bell-icon/bell-icon.component';
import { ProfileIconComponent } from '../components/icon/profile-icon/profile-icon.component';
import { BookIconComponent } from '../components/icon/book-icon/book-icon.component';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [ZapIconComponent, BellIconComponent, ProfileIconComponent, BookIconComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
})
export class MobileNavComponent {}
