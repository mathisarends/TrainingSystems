import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModalService } from '../../../service/modalService';
import { LoginComponent } from '../../Pages/login/login.component';
import { AuthenticatorService } from '../../auth/authenticator.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>;

  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private authService: AuthenticatorService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveLink();
      });
  }

  ngOnInit(): void {
    // Abonnieren des Anmeldestatus
    this.authService.isAuthenticated$.subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  async navigateTo(event: Event) {
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

  removeActiveState() {
    this.navLinks.forEach((link) => {
      link.nativeElement.classList.remove('active');
    });
  }

  updateActiveLink() {
    this.removeActiveState();
    const currentUrl = this.router.url;

    this.navLinks.forEach((link) => {
      const linkElement = link.nativeElement as HTMLAnchorElement;
      if (linkElement.pathname === currentUrl) {
        linkElement.classList.add('active');
      }
    });
  }

  handleLogin(event: Event) {
    event.preventDefault();

    this.router.navigate(['login']);
  }

  handleLogout(event: Event) {
    event.preventDefault();
    // handle real logout here, if sucessful represent state in header
    this.authService.logout();
  }

  // how to call modal Service
  test() {
    this.modalService.open(LoginComponent, 'Login', 'Anmelden');
  }
}
