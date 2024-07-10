import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profileService';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [SpinnerComponent],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: any;
  isLoading = true;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data.userDto;
        this.isLoading = false;
        console.log(
          '🚀 ~ ProfileComponent ~ ngOnInit ~ this.profile:',
          this.profile
        );
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Profils', err);
        this.isLoading = false;
      },
      complete: () => {
        console.log('Profil erfolgreich geladen');
      },
    });
  }
}
