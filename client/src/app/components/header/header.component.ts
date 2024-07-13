import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModalService } from '../../../service/modalService';
import { LoginComponent } from '../../Pages/login/login.component';
import { AuthenticatorService } from '../../auth/authenticator.service';
import { ProfileService } from '../../Pages/profile/profileService';
import { User } from '../../types/user';
import { SearchService } from '../../search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>; // QueryList to hold references to navigation links
  profile: User | null = null; // Holds user profile data
  isAuthenticated: boolean = false; // Tracks authentication status

  @Output() searchInput: EventEmitter<string> = new EventEmitter<string>();

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
    private modalService: ModalService,
    private authService: AuthenticatorService,
    private profileService: ProfileService,
    private searchService: SearchService
  ) {
    // Subscribe to router events to update active link on navigation end
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveLink();
      });
  }

  /**
   * Angular lifecycle hook that initializes the component.
   * Subscribes to authentication status and user profile data.
   */
  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.isAuthenticated$.subscribe((status) => {
      this.isAuthenticated = status;
    });

    // Fetch and subscribe to user profile data
    this.profileService.getProfile().subscribe({
      next: (data) => {
        console.log(
          '🚀 ~ HeaderComponent ~ this.profileService.getProfile ~ data:',
          data
        );
        this.profile = data.userDto;
      },
      error: (err) => {
        this.profile = null;
      },
      complete: () => {
        console.log('Profile successfully loaded');
      },
    });
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
  }

  /**
   * Handles the login action.
   * @param event - The login event
   */
  handleLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['login']);
  }

  /**
   * Handles the logout action.
   * @param event - The logout event
   */
  handleLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }

  /**
   * Example function to open a modal using the ModalService.
   */
  test(): void {
    this.modalService.open(LoginComponent, 'Login', 'Anmelden');
  }
}
