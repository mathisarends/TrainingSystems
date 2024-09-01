import { Component, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProfileService } from '../../Pages/profile/profileService';
import { User } from '../../types/user';
import { SearchService } from '../../../service/util/search.service';
import { TrainingDay } from '../../Pages/training-view/training-day';
import { NotificationService } from '../../notification-page/notification.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>;

  @ViewChild('trainingPlanLink') trainingPlanLink!: ElementRef;

  @ViewChild('statisticLink') statisticLink!: ElementRef;

  profile: User | null = null; // Holds user profile data
  isAuthenticated: boolean = false; // Tracks authentication status

  @Output() searchInput: EventEmitter<string> = new EventEmitter<string>();

  trainingDayNotifications$!: Observable<TrainingDay[]>;

  /**
   * Creates an instance of HeaderComponent.
   * Subscribes to router events and initializes services.
   * @param router - The router to navigate and listen to route changes.
   * @param modalService - Service to handle modal operations.
   * @param authService - Service to handle authentication operations.
   * @param profileService - Service to fetch user profile data.
   */
  constructor(
    private router: Router,
    private profileService: ProfileService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private socketService: SocketService,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateActiveLink();
    });
  }

  /**
   * Angular lifecycle hook that initializes the component.
   * Subscribes to authentication status and user profile data.
   */
  ngOnInit(): void {
    // Fetch and subscribe to user profile data
    this.profileService.getProfile().subscribe((data: any) => {
      if (data) {
        console.log('🚀 ~ HeaderComponent ~ this.profileService.getProfile ~ data:', data);
        this.profile = data.userDto;
      }
    });

    this.socketService.onTrainingDayNotificationMessage().subscribe(() => {
      this.loadTrainingDayNotifications();
    });

    // initially
    this.loadTrainingDayNotifications();
  }

  private loadTrainingDayNotifications() {
    this.trainingDayNotifications$ = this.notificationService.getTrainingDayNotifications();
  }

  /**
   * Handles the search input event and emits the value.
   * @param event - The input event
   */
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.searchService.updateSearchText(inputElement.value);
  }

  /**
   * Handles navigation to a different route.
   * @param event - The navigation event
   */
  async navigateTo(event: Event): Promise<void> {
    event.preventDefault();

    const linkElement = event.target as HTMLAnchorElement;
    const url = new URL(linkElement.href).pathname;

    this.removeActiveState();
    linkElement.classList.add('active');

    try {
      await this.router.navigate([url]);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  /**
   * Removes the active state from all navigation links.
   */
  private removeActiveState(): void {
    this.navLinks.forEach((link) => {
      link.nativeElement.classList.remove('active');
    });
  }

  /**
   * Updates the active link based on the current router URL.
   */
  private updateActiveLink(): void {
    this.removeActiveState();
    const currentUrl = this.router.url;

    this.navLinks.forEach((link) => {
      const linkElement = link.nativeElement as HTMLAnchorElement;
      if (linkElement.pathname === currentUrl) {
        linkElement.classList.add('active');
      }
    });

    if (currentUrl.includes('training/view?plan')) {
      this.trainingPlanLink.nativeElement.classList.add('active');
    } else if (currentUrl.includes('statistics')) {
      this.statisticLink.nativeElement.classList.add('active');
    }
  }
}
